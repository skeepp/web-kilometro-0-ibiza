import fs from 'fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function simulateWebhook() {
  const metadata = {
    userId: '9215b497-6a41-471f-aedc-f2dd2ae9fde5', // We'll fetch the first user
    cart: JSON.stringify([{ i: 'testProductId', q: 1 }])
  };

  // Get a real user and product for the test
  const { data: users } = await supabase.from('profiles').select('id, full_name').limit(1);
  if (!users || users.length === 0) return console.error("No users found");
  metadata.userId = users[0].id;
  
  const { data: products } = await supabase.from('products').select('id, price, producer_id').limit(1);
  if (!products || products.length === 0) return console.error("No products found");
  metadata.cart = JSON.stringify([{ i: products[0].id, q: 2 }]);

  console.log("Simulating for User", metadata.userId, "Cart", metadata.cart);

  // Now emulate webhook
  let cartItems;
  try {
      cartItems = JSON.parse(metadata.cart);
  } catch(e) { console.error('Parse error'); return; }

  const productIds = cartItems.map(item => item.i);
  const { data: dbProducts } = await supabase
      .from('products')
      .select('id, name, price, unit, producer_id')
      .in('id', productIds);

  if (!dbProducts || dbProducts.length === 0) {
      console.error('❌ Products not found');
      return;
  }
  
  const itemsByProducer = {};
  cartItems.forEach(cartItem => {
      const product = dbProducts.find(p => p.id === cartItem.i);
      if (product && product.producer_id) {
          if (!itemsByProducer[product.producer_id]) itemsByProducer[product.producer_id] = [];
          itemsByProducer[product.producer_id].push(cartItem);
      } else {
          console.warn('Product missing producer_id:', product);
      }
  });

  const producerIds = Object.keys(itemsByProducer);
  console.log("Grouped producers:", producerIds);

  const splitShipping = 5 / producerIds.length;

  for (const producerId of producerIds) {
      const producerCartItems = itemsByProducer[producerId];
      let producerNetSubtotal = 0;
      let producerRetailSubtotal = 0;

      // ... simulate the insert
      const orderItemsData = producerCartItems.map(cartItem => {
          const product = dbProducts.find(p => p.id === cartItem.i);
          const PLATFORM_MARKUP_RATE = 0.10;
          const netItemSubtotal = product.price * cartItem.q;
          const retailItemPrice = Number((product.price * (1 + PLATFORM_MARKUP_RATE)).toFixed(2));
          const retailItemSubtotal = retailItemPrice * cartItem.q;

          producerNetSubtotal += netItemSubtotal;
          producerRetailSubtotal += retailItemSubtotal;

          return {
              product_id: product.id,
              quantity: cartItem.q,
              unit_price: retailItemPrice,
              subtotal: retailItemSubtotal,
          };
      });

      console.log("Trying to insert order...");
      console.log({
              consumer_id: metadata.userId,
              producer_id: producerId,
              status: 'pending',
              delivery_name: 'Test',
              delivery_address: 'Test Addr',
              subtotal: Number(producerNetSubtotal.toFixed(2)),
              shipping_cost: Number(splitShipping.toFixed(2)),
              platform_fee: Number((producerRetailSubtotal - producerNetSubtotal).toFixed(2)),
              total: Number((producerRetailSubtotal + splitShipping).toFixed(2)),
              stripe_payment_intent_id: 'pi_test_' + Date.now(),
          });
          
      const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
              consumer_id: metadata.userId,
              producer_id: producerId,
              status: 'pending',
              delivery_name: 'Test',
              delivery_address: 'Test Addr',
              subtotal: Number(producerNetSubtotal.toFixed(2)),
              shipping_cost: Number(splitShipping.toFixed(2)),
              platform_fee: Number((producerRetailSubtotal - producerNetSubtotal).toFixed(2)),
              total: Number((producerRetailSubtotal + splitShipping).toFixed(2)),
              stripe_payment_intent_id: 'pi_test_' + Date.now(),
          })
          .select('id')
          .single();

      if (orderError) {
          console.error(`❌ Failed to create order:`, orderError);
      } else {
          console.log(`✅ Order ${order.id} inserted successfully!`);
          await supabase.from('orders').delete().eq('id', order.id); // cleanup
      }
  }
}

simulateWebhook();
