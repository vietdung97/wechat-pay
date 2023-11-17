// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
var key =
  "pk_test_51NzzmQLk2dEcCezEqChha442FK2zSJLQhicKOMYjZRzsKrZaHLerVU7XY4dlrqrrl9qdezwlggZZu10eXv2r7oqo001Jex9Ybe";
const stripe = Stripe(key);

let elements;

initialize();
checkStatus();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
  const qs = new URLSearchParams(window.location.search);
  const clientSecret = qs.get("clientSecret");
  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
  document.querySelector("#button-text").innerText = `Pay now (${getCurrencySymbol(paymentIntent.currency.toUpperCase())}${(paymentIntent.amount / 100).toFixed(2)})`

  const appearance = {
    theme: 'bubblegum',
    labels: 'floating'
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "accordion",
    terms: {
      card: 'always',
    },
    defaultCollapsed: false,
    radios: false,
    spacedAccordionItems: true
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "https://wechat-pay.vercel.app/",
      receipt_email: "abc@gmail.com",
    },
  });
  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "validation_error") {
    showMessage(error.message);
    return;
  }
  if (error.type) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView?.postMessage(JSON.stringify(error));
    }
    showMessage(error.message);
  }

  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

function getCurrencySymbol(currencyCode) {
  switch (currencyCode.toUpperCase()) {
    case 'CNY':
      return '¥'; // yuan
    case 'USD':
      return '$'; // dollar
    case 'EUR':
      return '€'; // euro
    case 'GBP':
      return '£'; // pound sterling
    case 'JPY':
      return '¥'; // yen
    case 'CHF':
      return 'SFr'; // Swiss franc
    // case 'CAD':
    //   return '$'; // Canadian dollar
    // case 'AUD':
    //   return '$'; // Australian dollar
    // case 'NZD':
    //   return '$'; // New Zealand dollar
    case 'INR':
      return '₹'; // Indian rupee
    case 'RUB':
      return '₽'; // Russian ruble
    case 'KRW':
      return '₩'; // South Korean won
    case 'TRY':
      return '₺'; // Turkish lira
    case 'THB':
      return '฿'; // Thai baht
    // case 'SGD':
    //   return '$'; // Singapore dollar
    case 'HKD':
      return 'HK$'; // Hong Kong dollar
    case 'MYR':
      return 'RM'; // Malaysian ringgit
    default:
      return currencyCode.toUpperCase(); // if no match, return the currency code itself
  }
}
