import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { createSupabaseAdminClient } from '@/utils/supabase/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid'; // For generating care task IDs if needed, though DB will gen
// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database

const supabaseAdmin = await createSupabaseAdminClient();

export async function POST(request: NextRequest) {
	try {
		const rawBody = await request.text();
		const signature = request.headers.get('stripe-signature');
		// verify Stripe event is legit
		let event;
		try {
			event = await stripe.webhooks.constructEventAsync(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
		} catch (error: any) {
			console.error(`Webhook signature verification failed: ${error.message}`);
			return NextResponse.json({ statusCode: 400, message: 'Webhook Error' }, { status: 400 });
		}

		const eventType = event.type;
		try {
			switch (eventType) {
				case 'checkout.session.completed': {
					// First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
					// ✅ Grant access to the product
					console.log('checkout.session.completed');
					const session: Stripe.Checkout.Session = event.data.object;
					const userId = session.metadata?.user_id;
					const customerId = session.customer;

					if (!userId) {
						console.error('User ID not found in session metadata');
						// Potentially return an error response, though Stripe expects 200 for successful receipt
						// For now, log and break, as we can't create care tasks without user_id
						break;
					}

					// For one-time purchases, session.subscription might be null.
					// We need to handle both subscription and one-time purchase scenarios.
					let subscriptionId: string | null = null;
					let planExpires: number | null = null;

					if (session.mode === 'subscription' && session.subscription) {
						const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
						subscriptionId = subscription.id;
						planExpires = subscription.current_period_end * 1000;

						// Create or update the stripe_customer_id in the stripe_customers table
						const { error: customerError } = await supabaseAdmin.from('stripe_customers')
							.upsert([{
								user_id: userId as string,
								stripe_customer_id: customerId as string,
								subscription_id: subscriptionId,
								plan_active: true,
								plan_expires: planExpires
							}]);
						if (customerError) {
							console.error('Error upserting stripe_customer for subscription:', customerError);
						}
					} else if (session.mode === 'payment') {
						// Handle one-time payment specific logic if needed for customer record
						// For now, we might not need a separate entry in stripe_customers for one-time payments
						// unless there's a specific need to track them there.
						console.log('One-time payment checkout session completed.');
					}

					// --- Care Calendar Generation Logic ---
					console.log('Attempting to generate care tasks for user:', userId);
					const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

					if (!lineItems || lineItems.data.length === 0) {
						console.error('No line items found for checkout session:', session.id);
						break;
					}

					for (const item of lineItems.data) {
						try {
							const productIdStripe = item.price?.product as string;
							if (!productIdStripe) {
								console.warn('Stripe Product ID not found for line item:', item.id);
								continue;
							}

							const stripeProduct = await stripe.products.retrieve(productIdStripe);
							const listingId = stripeProduct.metadata?.listing_id;
							if (!listingId) {
								console.warn('Internal listing_id not found in Stripe product metadata for Stripe product:', productIdStripe);
								continue;
							}

							console.log(`Processing listing_id: ${listingId} for care task generation.`);

							const { data: listingData, error: listingError } = await supabaseAdmin
								.from('listing')
								.select('care_details, care_tips')
								.eq('id', listingId)
								.single();

							if (listingError) {
								console.error(`Error fetching listing ${listingId} for care task generation:`, listingError);
								continue; 
							}

							const careTasksToInsert = [];
							const now = new Date();

							if (listingData?.care_details) {
								try {
									console.log(`Attempting to parse structured care details for listing ${listingId}.`);
									const parsedDetails = JSON.parse(listingData.care_details);
									
									let allCareTips = parsedDetails.care_tips || [];
									const essentialTasks: { title: string; description: string; frequency_days: number }[] = [];

									// Separate essential from optional tasks
									if (parsedDetails.actionable_tasks && Array.isArray(parsedDetails.actionable_tasks)) {
										parsedDetails.actionable_tasks.forEach((task: any) => {
											if (task.is_optional) {
												// For optional tasks, add their description to the general care tips list
												allCareTips.push(`${task.title}: ${task.description}`);
											} else {
												essentialTasks.push(task);
											}
										});
									}

									// Update listing with combined care_tips (original tips + optional tasks)
									if (allCareTips.length > 0) {
										const { error: updateError } = await supabaseAdmin
											.from('listing')
											.update({ care_tips: allCareTips })
											.eq('id', listingId);

										if (updateError) {
											console.error(`Failed to update listing ${listingId} with combined care_tips:`, updateError);
										} else {
											console.log(`Successfully stored ${allCareTips.length} care tips for listing ${listingId}.`);
										}
									}
									
									// Schedule the essential, non-optional tasks
									if (essentialTasks.length > 0) {
										console.log(`Creating ${essentialTasks.length} essential tasks for listing ${listingId}.`);
										let dayOffset = -1; // Start first task yesterday for testing
										
										for (const task of essentialTasks) {
											const dueDate = new Date(now);
											dueDate.setDate(now.getDate() + dayOffset);
											
											careTasksToInsert.push({
												user_id: userId,
												listing_id: listingId,
												title: task.title,
												task_description: task.description,
												due_date: dueDate.toISOString(),
												completed: false,
												is_optional: false,
											});
											// Use the frequency from the AI to schedule the next task
											dayOffset += task.frequency_days || 7; 
										}
									}

								} catch (e) {
									// Fallback for old data: care_details is a simple string.
									console.warn(`Could not parse care_details as JSON for listing ${listingId}. Treating as plain text.`);
									const actionableTasks = listingData.care_details.split('\n').filter(line => line.trim().length > 0);
									let dayOffset = -1; 
									for (const task of actionableTasks) {
										const dueDate = new Date(now);
										dueDate.setDate(now.getDate() + dayOffset);
										careTasksToInsert.push({
											user_id: userId,
											listing_id: listingId,
											title: task.substring(0, 40) + '...', // Create a generic title
											task_description: task,
											due_date: dueDate.toISOString(),
											completed: false,
											is_optional: false,
										});
										dayOffset += 7;
									}
								}
							}

							// Fallback to generic tasks if no actionable tasks were found at all
							if (careTasksToInsert.length === 0) {
								console.warn(`No actionable tasks found for listing ${listingId}. Using generic tasks as a fallback.`);
								const tasksDefinitions = [
									{ title: 'Water your new plant', description: 'Give your new plant a good drink of water.', daysOffset: 1 },
									{ title: 'Check the soil', description: 'See if the soil is dry. If it is, time for more water!', daysOffset: 3 },
									{ title: 'Turn me around!', description: 'Rotate the plant so all its leaves get some sun.', daysOffset: 7 },
								];
								
								for (const taskDef of tasksDefinitions) {
									const dueDate = new Date(now);
									dueDate.setDate(now.getDate() + taskDef.daysOffset);
									careTasksToInsert.push({
										user_id: userId,
										listing_id: listingId,
										title: taskDef.title,
										task_description: taskDef.description,
										due_date: dueDate.toISOString(),
										completed: false,
										is_optional: false,
									});
								}
							}

							if (careTasksToInsert.length > 0) {
								const { error: careTaskError } = await supabaseAdmin
									.from('care_task')
									.insert(careTasksToInsert);

								if (careTaskError) {
									console.error(`Error inserting care tasks for listing ${listingId}:`, careTaskError);
								} else {
									console.log(`Successfully inserted ${careTasksToInsert.length} care tasks for listing ${listingId}.`);
								}
							}
						} catch (itemError) {
							console.error('Error processing a line item:', itemError);
						}
					}
					// --- End of Care Calendar Generation Logic ---

					// Original subscription handling (if applicable)
					// This part was moved up to handle subscriptions first, then care tasks
					// const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
					// const { data, error } = await supabaseAdmin.from('stripe_customers')
					// 	.upsert([{
					// 		user_id: userId as string,
					// 		stripe_customer_id: customerId as string,
					// 		subscription_id: session.subscription as string,
					// 		plan_active: true,
					// 		plan_expires: subscription.current_period_end * 1000
					// 	}]);
					// if (error) {
					// 	console.log('checkout.session.completed.....', error);
					// }
					break;
				}

				case 'customer.subscription.updated': {
					// The customer might have changed the plan (higher or lower plan, cancel soon etc...)
					console.log('subscription.updated.....');
					const subscription: Stripe.Subscription = event.data.object;
					// console.log(subscription);
					const processedData = processSubscriptionWebhook(subscription);
					if (processedData?.type === 'cancellation') {
						console.log('subscription cancelled .....', processedData);
					} else if (processedData?.type === 'new_subscription') {
						console.log('subscription new .....');
					} else if (processedData?.type === 'renewal') {
						console.log('subscription renewal .....', processedData);
					}
					break;
				}

				case 'customer.subscription.deleted': {
					// The customer subscription stopped
					// refund the subscription
					// ❌ Revoke access to the product
					const subscription = event.data.object;
					console.log('customer.subscription.deleted..........');
					const { error } = await supabaseAdmin
						.from('stripe_customers')
						.update({ plan_active: false, subscription_id: null })
						.eq('subscription_id', subscription.id);
					if (error) {
						console.log('customer.subscription.deleted..........', error);
					}
					break;
				}

				case 'invoice.payment_succeeded': {
					const invoice = event.data.object;
					console.log("invoice payment succeeded......");
					// Extract plan and product info from the first line item
					// const lineItem = invoice.lines.data[0];

					// const qty = lineItem.quantity ?? 1;
					// let plan_expires_time = null;
					// plan_expires_time = new Date().getTime() + qty * 30 * 24 * 60 * 60 * 1000;

					// const subscription_id = invoice.subscription;
					// const { data: subscription_data, error: subscription_error } = await supabaseAdmin
					// 	.from('stripe_customers')
					// 	.select('subscription_id')
					// 	.eq('subscription_id', subscription_id);
					// console.log("subscription_data", subscription_data);
					// console.log("subscription_error", subscription_error);
					// const { data, error } = await supabaseAdmin
					// 	.from('stripe_customers')
					// 	.update({ plan_expires: plan_expires_time })
					// 	.eq('subscription_id', subscription_id);
					// console.log("update plan_expires ", data, error);
					break;
				}

				case 'invoice.payment_failed': {
					// A payment failed (for instance the customer does not have a valid payment method)
					// ❌ Revoke access to the product
					// ⏳ OR wait for the customer to pay (more friendly):
					//      - Stripe will automatically email the customer (Smart Retries)
					//      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired
					break;
				}

				case 'invoice.paid': {
					// Customer just paid an invoice (for instance, a recurring payment for a subscription)
					// ✅ Grant access to the product
					const priceId = event.data.object.lines.data[0].price?.id;
					const customerId = event.data.object.customer;
					console.log("event.data.object");
					console.log("priceId", priceId);
					console.log("customerId", customerId);
					// Make sure the invoice is for the same plan (priceId) the user subscribed to

					break;
				}

				case 'charge.refunded': {
					const charge = event.data.object;
					console.log('charge.refunded.........');
					console.log('refund amount:', charge.amount_refunded);
					console.log('charge id:', charge.id);
					break;
				}
			}
		} catch (error: any) {
			console.error('Error processing webhook:', error);
			return NextResponse.json({ message: error.message }, { status: 500 });
		}

		return NextResponse.json({ statusCode: 200, message: 'success' });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

// 定义提取的数据类型
interface BaseSubscriptionData {
	subscription_id: string;
	customer_id: string;
	status: string;
	type: 'new_subscription' | 'renewal' | 'cancellation';
}

interface NewSubscriptionData extends BaseSubscriptionData {
	type: 'new_subscription';
	start_date: number;
	current_period_start: number;
	current_period_end: number;
	plan_amount: number;
	currency: string;
	latest_invoice: string;
}

interface RenewalData extends BaseSubscriptionData {
	type: 'renewal';
	current_period_start: number;
	current_period_end: number;
	plan_amount: number;
	currency: string;
	latest_invoice: string;
}

interface CancellationData extends BaseSubscriptionData {
	type: 'cancellation';
	cancel_at_period_end: boolean;
	canceled_at: number;
	cancel_at: number;
	reason: string;
	current_period_end: number;
}

type SubscriptionData = NewSubscriptionData | RenewalData | CancellationData;

// 处理 Webhook 的函数
function processSubscriptionWebhook(subscription: Stripe.Subscription): SubscriptionData | null {
	const baseData = {
		subscription_id: subscription.id,
		customer_id: subscription.customer as string,
		status: subscription.status,
	};

	// 退订: 有 cancel_at_period_end 和 canceled_at
	if (subscription.cancel_at_period_end && subscription.canceled_at) {
		return {
			...baseData,
			type: 'cancellation',
			cancel_at_period_end: subscription.cancel_at_period_end,
			canceled_at: subscription.canceled_at,
			cancel_at: subscription.cancel_at!,
			reason: subscription.cancellation_details?.reason || 'unknown',
			current_period_end: subscription.current_period_end,
		};
	}

	// 新订阅: created 和 current_period_start 相同
	if (subscription.created === subscription.current_period_start) {
		const items = subscription.items.data[0];
		return {
			...baseData,
			type: 'new_subscription',
			start_date: subscription.start_date,
			current_period_start: subscription.current_period_start,
			current_period_end: subscription.current_period_end,
			plan_amount: items?.price?.unit_amount || 0,
			currency: subscription.currency,
			latest_invoice: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id || '',
		};
	}

	// 续订: created 早于 current_period_start
	const items = subscription.items.data[0];
	return {
		...baseData,
		type: 'renewal',
		current_period_start: subscription.current_period_start,
		current_period_end: subscription.current_period_end,
		plan_amount: items?.price?.unit_amount || 0,
		currency: subscription.currency,
		latest_invoice: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id || '',
	};
}