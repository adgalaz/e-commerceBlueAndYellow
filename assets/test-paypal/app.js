const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZ7QE5jYOhVlyrzraRGChQAHyt2P88voQ_Laq3256GYMucbJEOLRUqEyzy_INl5Iytx9lD1pS2Hjdsflds',
  'client_secret': 'EIg05HuDvJQOtqZKeY2B6X4MJi8dIlsPBr-D1RzFVBnaM5PeTwmPaWPfBqpqthHwSX9yuFJV1Yc_jndsnsd'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));


app.post('/pay', (req, res) => {
  //  const price = $('#total').html();
  // const total = (window['total'].innerHTML);
  // console.log(total);
  const create_payment_json = {
    'intent': 'sale',
    'payer': {
      'payment_method': 'paypal'
    },
    'redirect_urls': {
      'return_url': 'http://localhost:3000/success',
      'cancel_url': 'http://localhost:3000/cancel'
    },
    'transactions': [{
      'item_list': {
        'items': [{
          'name': 'Spring fever embroidered linen top',
          'sku': '001',
          'price': '$23.98',
          'currency': 'USD',
          'quantity': 1
        }]
      },
      'amount': {
        'currency': 'USD',
        'total': '$23.98'
      },
      'description': 'Spring fever embroidered linen top'
    }]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0;i < payment.links.length;i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    'payer_id': payerId,
    'transactions': [{
      'amount': {
        'currency': 'USD',
        'total': '$23.98'
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));