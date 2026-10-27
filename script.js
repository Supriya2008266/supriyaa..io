/* ==========================================================
   ResolveAI – frontend MVP demo
   All AI behaviour here is SIMULATED (keyword rules + mock
   data). Nothing is sent to a server.
   ========================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. Utilities
     --------------------------------------------------------- */
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) =>
    String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
  const firstName = (n) => String(n).trim().split(/\s+/)[0];
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function formatAgo(ts) {
    const min = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (min < 1) return 'Just now';
    if (min < 60) return min + ' min ago';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' hr ago';
    const d = Math.floor(h / 24);
    return d + (d === 1 ? ' day ago' : ' days ago');
  }
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    sget(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    sdel(k) { try { window.sessionStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  /* ---------------------------------------------------------
     2. Icons (inline SVG, Lucide-style)
     --------------------------------------------------------- */
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    ticket: '<path d="M3 9a2 2 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z"/><path d="M13 5v3M13 11v2M13 16v3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    bot: '<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V5M8 14h.01M16 14h.01"/><circle cx="12" cy="3.5" r="1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 18l6-6-6-6"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    languages: '<path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c6 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2M1 1l22 22"/>',
  };
  function icon(name, size) {
    const s = size || 18;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }
  const logoMark = () => '<span class="logo-mark">' + icon('shieldCheck', 18) + '</span>';

  /* ---------------------------------------------------------
     3. Constants & mock "AI" knowledge base
     --------------------------------------------------------- */
  const NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'tickets', label: 'Tickets', icon: 'ticket' },
    { key: 'teams', label: 'Teams', icon: 'users' },
    { key: 'rewards', label: 'Rewards', icon: 'gift' },
    { key: 'rules', label: 'AI Rules', icon: 'sparkles' },
    { key: 'analytics', label: 'Analytics', icon: 'chart' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];
  const OPEN_STATUSES = ['New', 'Assigned', 'In Progress', 'Awaiting Customer'];
  const LIFECYCLE = ['New', 'Assigned', 'In Progress', 'Resolved', 'Customer Confirmed', 'Closed'];
  const STAGE = { 'New': 0, 'Assigned': 1, 'In Progress': 2, 'Awaiting Customer': 2, 'Resolved': 3, 'Customer Confirmed': 4, 'Closed': 5 };
  const FAULT_LABEL = { seller: 'Seller Fault', customer: 'Customer Fault', unclear: 'Needs Review', pending: 'Pending' };
  const LANGS = { en: 'English', ta: 'Tamil', tg: 'Tanglish' };
  const ANALYSIS_STEPS = ['Classifying priority', 'Detecting responsible team', 'Running fault check', 'Recommending resolution', 'Drafting reply'];

  const TEAMS = [
    { name: 'Support Team', lead: 'Divya Menon', members: 4, icon: 'users', blurb: 'General questions, address and account help' },
    { name: 'Returns & Refunds', lead: 'Arjun Pillai', members: 3, icon: 'inbox', blurb: 'Replacements, reverse pickups and refunds' },
    { name: 'Delivery Team', lead: 'Sanjay Kumar', members: 3, icon: 'clock', blurb: 'Courier follow-ups, delays and lost parcels' },
    { name: 'Technical Support', lead: 'Nisha Varghese', members: 2, icon: 'shield', blurb: 'Account security and app or site issues' },
    { name: 'Billing Team', lead: 'Rohan Iyer', members: 2, icon: 'chart', blurb: 'Payments, double charges and invoices' },
  ];

  /* Each category is one "case type" the mock AI can recognise. */
  const CATEGORIES = {
    wrong_product: {
      label: 'Wrong product received',
      title: 'Order {order} was delivered with the wrong product',
      keywords: ['wrong', 'badhila', 'instead of', 'replace', 'different product', 'different item'],
      priority: 'High',
      priorityReason: 'Wrong product received. Customer expects replacement.',
      team: 'Returns & Refunds',
      fault: 'seller', confidence: 94,
      faultReason: "Order records indicate that the seller shipped a different SKU from the customer's purchased item.",
      interpretation: 'Customer received the wrong product and is requesting a replacement.',
      steps: ["Verify the customer's order SKU.", 'Compare shipped SKU with ordered SKU.', 'Approve replacement.', 'Arrange reverse pickup.', 'Ask customer to confirm after receiving the replacement.'],
      rewardAmount: 150,
      replies: {
        en: "Hi {name}, we're sorry you received the wrong product. We have started the replacement process and will arrange a free pickup of the item. Please confirm once you receive the replacement.",
        ta: 'வணக்கம் {name}, தவறான பொருள் வந்ததற்கு வருந்துகிறோம். மாற்று பொருளை அனுப்பும் செயல்முறையை தொடங்கியுள்ளோம். புதிய பொருள் கிடைத்ததும் தயவு செய்து உறுதிப்படுத்தவும்.',
        tg: 'Hi {name}, unga order-la wrong product receive aagirukku. Sorry for the inconvenience. Nanga replacement process-a initiate panrom. Replacement receive pannadhum please confirm pannunga.',
      },
    },
    late_delivery: {
      label: 'Order not delivered',
      title: 'Order {order} has not been delivered on time',
      keywords: ['not delivered', 'delay', 'still not', 'supposed to arrive', 'tracking', 'delivery aagala', 'varala', 'not arrived', 'where is my order'],
      priority: 'High',
      priorityReason: 'Delivery is overdue and the customer has no tracking updates.',
      team: 'Delivery Team',
      fault: 'seller', confidence: 81,
      faultReason: 'Dispatch logs show the parcel left the warehouse late and the courier scan has not updated since.',
      interpretation: 'Customer says the order has not arrived and wants an update.',
      steps: ['Check the courier tracking status.', 'Contact the courier partner for a trace.', 'Re-ship the order if the parcel is lost.', 'Share an updated delivery date with the customer.', 'Ask the customer to confirm receipt.'],
      rewardAmount: 100,
      replies: {
        en: "Hi {name}, sorry your order is delayed. We are checking with the courier partner and will share an updated delivery date within 24 hours.",
        ta: 'வணக்கம் {name}, உங்கள் ஆர்டர் தாமதமானதற்கு வருந்துகிறோம். கூரியர் நிறுவனத்துடன் சரிபார்த்து 24 மணி நேரத்திற்குள் புதிய டெலிவரி தேதியை தெரிவிக்கிறோம்.',
        tg: 'Hi {name}, unga order late aagiduchu, sorry. Courier partner kitta check panni 24 hours-la new delivery date share panrom.',
      },
    },
    payment_failure: {
      label: 'Payment failed',
      title: 'Payment deducted but order {order} not confirmed',
      keywords: ['payment', 'deduct', 'debit', 'upi', 'fail', 'charged twice', 'double charge', 'transaction'],
      priority: 'High',
      priorityReason: "Customer's money may be held without an order, which needs a quick answer.",
      team: 'Billing Team',
      fault: 'unclear', confidence: 58,
      faultReason: 'Gateway logs are inconclusive: the debit may be a pending authorization hold or a failed capture.',
      interpretation: 'Customer says the payment failed but the amount was still deducted.',
      steps: ['Look up the transaction in the payment gateway.', 'Check whether the debit is a hold or a capture.', 'Confirm if an order was created.', 'Trigger a reversal if no order exists.', 'Share the reference number with the customer.'],
      rewardAmount: 0,
      replies: {
        en: 'Hi {name}, thanks for flagging this. We are verifying the transaction with our payment gateway. If the amount was debited without an order, it will be reversed to your account within 5-7 working days.',
        ta: 'வணக்கம் {name}, தகவலுக்கு நன்றி. பரிவர்த்தனையை பேமெண்ட் கேட்வேயில் சரிபார்த்து வருகிறோம். ஆர்டர் இல்லாமல் தொகை பிடித்தம் செய்யப்பட்டிருந்தால் 5-7 வேலை நாட்களில் திரும்ப வரவு வைக்கப்படும்.',
        tg: 'Hi {name}, thanks for telling us. Payment gateway-la transaction-a verify panrom. Order create aagama paisa cut aagirundha, 5-7 working days-la automatic-a refund aagidum.',
      },
    },
    account_hacking: {
      label: 'Account hacked',
      title: 'Possible account takeover reported on order {order}',
      keywords: ['hack', 'account takeover', 'unauthorized', 'password changed', 'did not place', 'compromised', 'someone logged'],
      priority: 'Critical',
      priorityReason: 'Possible account takeover with unauthorized orders. Security risk.',
      team: 'Technical Support',
      fault: 'unclear', confidence: 52,
      faultReason: 'Security incidents need manual verification before responsibility can be assigned.',
      interpretation: 'Customer believes their account was hacked and orders were placed without consent.',
      steps: ['Lock the account and revoke all sessions.', 'Verify identity through the registered phone or email.', 'Review recent logins and orders.', 'Cancel unauthorized orders.', 'Guide the customer through a secure password reset.'],
      rewardAmount: 0,
      replies: {
        en: 'Hi {name}, we take this seriously. We have temporarily locked your account and signed out all devices. Please verify your identity using the OTP we sent, then reset your password.',
        ta: 'வணக்கம் {name}, இதை மிகவும் முக்கியமாக எடுத்துக்கொள்கிறோம். உங்கள் கணக்கை தற்காலிகமாக பூட்டி அனைத்து சாதனங்களிலிருந்தும் வெளியேற்றியுள்ளோம். அனுப்பிய OTP மூலம் அடையாளத்தை உறுதிசெய்து கடவுச்சொல்லை மாற்றவும்.',
        tg: 'Hi {name}, idha romba seriousa edukrom. Unga account-a temporary-a lock panni ella device-layum logout pannitom. Anuppuna OTP vechu verify panni password reset pannunga.',
      },
    },
    refund_request: {
      label: 'Refund request',
      title: 'Refund requested for order {order}',
      keywords: ['refund', 'changed my mind', 'change my mind', 'money back', 'cancel order', 'cancel my order'],
      priority: 'Medium',
      priorityReason: 'Standard refund request with no urgency flags.',
      team: 'Returns & Refunds',
      fault: 'customer', confidence: 88,
      faultReason: 'The customer changed their mind within the return window. No seller error was found on the order.',
      interpretation: 'Customer wants their money back because they no longer want the item.',
      steps: ['Check the order against the return policy.', 'Confirm the item is eligible for return.', 'Arrange pickup of the item.', 'Process the refund to the original payment method.', 'Confirm the refund timeline with the customer.'],
      rewardAmount: 0,
      replies: {
        en: 'Hi {name}, your refund request is being processed under our return policy. Since the item is eligible, the amount will be credited to your original payment method within 5-7 working days after pickup.',
        ta: 'வணக்கம் {name}, உங்கள் பணத்திரும்பப் பெறும் கோரிக்கை திரும்பப் பெறும் கொள்கையின்படி பரிசீலிக்கப்படுகிறது. பொருள் எடுக்கப்பட்ட பிறகு 5-7 வேலை நாட்களில் தொகை உங்கள் கணக்கில் வரவு வைக்கப்படும்.',
        tg: 'Hi {name}, unga refund request return policy-padi process panrom. Item pickup aana 5-7 working days-la original payment method-ku paisa credit aagidum.',
      },
    },
    damaged: {
      label: 'Product damaged',
      title: 'Order {order} arrived with a damaged product',
      keywords: ['damage', 'broken', 'torn', 'cracked', 'udanji', 'defective', 'open aagi', 'not working'],
      priority: 'High',
      priorityReason: 'Product arrived damaged. Customer expects a replacement or refund.',
      team: 'Returns & Refunds',
      fault: 'seller', confidence: 90,
      faultReason: 'Packing photos from dispatch show thin packaging, which is consistent with transit damage.',
      interpretation: "Customer says the parcel arrived opened and the product is broken; they want a replacement.",
      steps: ['Ask the customer for photos of the product and packaging.', 'Compare with dispatch packing photos.', 'Approve replacement.', 'Arrange reverse pickup of the damaged item.', 'Ask the customer to confirm after the replacement arrives.'],
      rewardAmount: 200,
      replies: {
        en: "Hi {name}, we're sorry the product arrived damaged. Please share a photo of the item and packaging, and we will arrange a replacement right away.",
        ta: 'வணக்கம் {name}, பொருள் சேதமடைந்து வந்ததற்கு வருந்துகிறோம். பொருள் மற்றும் பேக்கிங்கின் புகைப்படத்தை பகிரவும், உடனடியாக மாற்று பொருள் ஏற்பாடு செய்கிறோம்.',
        tg: 'Hi {name}, product damage aagi vandhadhuku sorry. Product, packing photo share pannunga, udane replacement arrange panrom.',
      },
    },
    address_change: {
      label: 'Change delivery address',
      title: 'Address change requested for order {order}',
      keywords: ['address', 'pincode', 'deliver to another', 'maatha', 'relocat'],
      priority: 'Low',
      priorityReason: 'Simple customer-initiated request with no delivery impact yet.',
      team: 'Support Team',
      fault: 'customer', confidence: 97,
      faultReason: 'Address updates are customer-initiated requests, not a seller error.',
      interpretation: 'Customer wants to change the delivery address on an existing order.',
      steps: ['Check that the order has not shipped.', 'Confirm the new address and pincode with the customer.', 'Update the order address.', 'Notify the courier of the change.'],
      rewardAmount: 0,
      replies: {
        en: 'Hi {name}, we can update the delivery address as the order has not been shipped. Please confirm the new address and pincode.',
        ta: 'வணக்கம் {name}, ஆர்டர் இன்னும் அனுப்பப்படாததால் டெலிவரி முகவரியை மாற்றலாம். புதிய முகவரி மற்றும் பின்கோடை உறுதிப்படுத்தவும்.',
        tg: 'Hi {name}, order innum ship aagala, so address maathalam. Puthu address, pincode confirm pannunga.',
      },
    },
    misunderstanding: {
      label: 'Offer misunderstanding',
      title: 'Customer disputes pricing on order {order}',
      keywords: ['thought', 'offer', 'price', 'expected', 'size chart', 'discount', 'coupon'],
      priority: 'Low',
      priorityReason: 'Pricing question with no loss to the customer; low urgency.',
      team: 'Support Team',
      fault: 'customer', confidence: 76,
      faultReason: 'The offer terms show the discount excluded this product, and the item was charged as listed.',
      interpretation: 'Customer expected a discount that does not apply to this item.',
      steps: ['Review the offer terms against the ordered item.', 'Explain which products the offer covers.', 'Suggest an eligible alternative if available.', 'Close the ticket once the customer understands.'],
      rewardAmount: 0,
      replies: {
        en: "Hi {name}, thanks for reaching out. The offer you mentioned applies only to selected products, and this item is not included. We're happy to help you find an eligible alternative.",
        ta: 'வணக்கம் {name}, தொடர்பு கொண்டதற்கு நன்றி. நீங்கள் குறிப்பிட்ட சலுகை குறிப்பிட்ட பொருட்களுக்கு மட்டுமே பொருந்தும்; இந்த பொருள் அதில் சேரவில்லை. தகுதியான மாற்று பொருளை தேர்வு செய்ய உதவுகிறோம்.',
        tg: 'Hi {name}, contact pannadhuku thanks. Andha offer selected products-ku mattum dhaan, indha item-la include aagala. Eligible alternative select panna help panrom.',
      },
    },
    general: {
      label: 'General enquiry',
      title: 'General support request about order {order}',
      keywords: [],
      priority: 'Medium',
      priorityReason: 'No urgency signals detected. Treated as a standard request.',
      team: 'Support Team',
      fault: 'unclear', confidence: 45,
      faultReason: 'The message does not contain enough detail to decide who is responsible.',
      interpretation: 'Customer is asking for help; more details are needed.',
      steps: ['Read the full message and order history.', 'Ask the customer for any missing details.', 'Decide on the next action once the cause is clear.'],
      rewardAmount: 0,
      replies: {
        en: 'Hi {name}, thanks for contacting us. We are reviewing your request and a support agent will get back to you shortly.',
        ta: 'வணக்கம் {name}, எங்களை தொடர்பு கொண்டதற்கு நன்றி. உங்கள் கோரிக்கையை பரிசீலித்து விரைவில் தொடர்பு கொள்கிறோம்.',
        tg: 'Hi {name}, contact pannadhuku thanks. Unga request-a review panrom, support agent seekiram reply pannuvanga.',
      },
    },
  };

  const TANGLISH_HINTS = ['pannunga', 'panna', 'vandhurukku', 'vandhuruku', 'vandhuchu', 'aagi', 'aagala', 'aagirukku', 'venum', 'illa', 'irukku', 'bro ', 'badhila', 'udanji', 'enna ', 'seri ', 'paisa', 'kudunga', 'varala', ' ah ', 'naan ', 'unga '];

  /** Simulated language detection. */
  function detectLanguage(text) {
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
    const lower = ' ' + text.toLowerCase() + ' ';
    return TANGLISH_HINTS.some((h) => lower.indexOf(h) !== -1) ? 'Tanglish' : 'English';
  }

  /** Simulated classifier: scores each case type by keyword hits. */
  function classify(text) {
    const lower = String(text).toLowerCase();
    let best = 'general';
    let bestScore = 0;
    Object.keys(CATEGORIES).forEach((key) => {
      const kws = CATEGORIES[key].keywords;
      let score = 0;
      kws.forEach((kw) => {
        if (new RegExp('\\b' + regexEscape(kw), 'i').test(lower)) score += 1;
      });
      if (score > bestScore) { best = key; bestScore = score; }
    });
    return best;
  }

  /** Builds the full mock AI result for a ticket. */
  function buildAnalysis(ticket) {
    const category = classify(ticket.message);
    const c = CATEGORIES[category];
    const name = firstName(ticket.customer);
    const fill = (s) => s.replace(/\{name\}/g, name);
    return {
      category: category,
      label: c.label,
      title: c.title,
      priority: c.priority,
      priorityReason: c.priorityReason,
      team: c.team,
      teamReason: 'Cases like "' + c.label.toLowerCase() + '" are normally handled by ' + c.team + '.',
      fault: c.fault,
      confidence: c.confidence,
      faultReason: c.faultReason,
      interpretation: c.interpretation,
      steps: c.steps.slice(),
      rewardAmount: c.rewardAmount,
      replies: { en: fill(c.replies.en), ta: fill(c.replies.ta), tg: fill(c.replies.tg) },
    };
  }

  /* ---------------------------------------------------------
     4. Mock data & application state
     --------------------------------------------------------- */
  const DEFAULT_SETTINGS = {
    business: { name: 'Kovai Kicks', email: 'support@kovaikicks.in', phone: '+91 98765 43210', timezone: 'Asia/Kolkata' },
    reward: { maxReward: 500, monthlyBudget: 10000, repeatThreshold: 4, ownerApproval: true, customerMonthlyCap: 1000, customerMonthlyCount: 5 },
    ai: { autoAnalyze: false, suggestReplies: true, reviewBelow: 70 },
    language: { defaultReply: 'tg', detectTanglish: true },
    notifications: { email: true, reward: true, highPriority: true },
  };

  const DEFAULT_RULES = [
    { id: 'r1', text: 'If the customer mentions hacking or account takeover, mark the ticket as High Priority.', enabled: true },
    { id: 'r2', text: 'If the customer reports a wrong product, assign it to Returns & Refunds.', enabled: true },
    { id: 'r3', text: 'If the seller is responsible and the customer confirms resolution, make the ticket eligible for reward review.', enabled: true },
    { id: 'r4', text: 'If the same customer submits 4 or more similar complaints in a month, flag for abuse review.', enabled: true },
  ];

  const SEED_TICKETS = [
    { id: 'TKT-1049', customer: 'Meena S', order: '#7842', language: 'Tanglish', message: 'Bro product wrong ah vandhurukku. Replace pannunga.', status: 'New', analyzed: false, created: 12, updated: 12, repeat: 0 },
    { id: 'TKT-1048', customer: 'Karthik R', order: '#7790', language: 'English', message: 'My order #7790 was supposed to arrive last Thursday. Tracking has not updated for 5 days and it is still not delivered.', status: 'Assigned', analyzed: true, created: 95, updated: 60, repeat: 0 },
    { id: 'TKT-1047', customer: 'Divya Lakshmi', order: '#7781', language: 'English', message: 'Payment failed on UPI but money got deducted from my account. The order is not showing in my orders page.', status: 'Awaiting Customer', analyzed: true, created: 180, updated: 120, repeat: 2 },
    { id: 'TKT-1046', customer: 'Suresh Babu', order: '#7775', language: 'English', message: 'Someone hacked my account and changed my password. I can see orders I did not place. Please help urgently!', status: 'In Progress', analyzed: true, created: 240, updated: 35, repeat: 0 },
    { id: 'TKT-1045', customer: 'Lakshmi Priya', order: '#7766', language: 'English', message: 'I changed my mind about order #7766. Please refund my money.', status: 'Closed', analyzed: true, created: 420, updated: 200, repeat: 0 },
    { id: 'TKT-1044', customer: 'Vignesh K', order: '#7759', language: 'Tanglish', message: 'Bro parcel open aagi vandhuchu, product udanjiduchu. Replacement venum.', status: 'In Progress', analyzed: true, created: 600, updated: 150, repeat: 4 },
    { id: 'TKT-1043', customer: 'Anitha M', order: '#7744', language: 'English', message: 'I thought the 20% offer applied to this item too, but I was charged full price at checkout.', status: 'Awaiting Customer', analyzed: true, created: 1100, updated: 600, repeat: 0 },
    { id: 'TKT-1042', customer: 'Arun Kumar', order: '#7821', language: 'Tanglish', message: 'Bro, naan order panna black shoes-ku badhila blue shoes vandhurukku. Please replace pannunga.', status: 'Customer Confirmed', analyzed: true, created: 1500, updated: 45, repeat: 1 },
    { id: 'TKT-1041', customer: 'Priya', order: '#7815', language: 'English', message: 'Wrong product received. I ordered a white kurta in Order #7815 but got a green one instead of the white.', status: 'Customer Confirmed', analyzed: true, created: 2100, updated: 400, repeat: 0, decision: 'approved' },
    { id: 'TKT-1040', customer: 'Rahul', order: '#7801', language: 'English', message: 'How to change address for order #7801? I moved to a new flat.', status: 'Resolved', analyzed: true, created: 2900, updated: 1300, repeat: 0 },
  ];

  const daysAgo = (d) => Date.now() - d * 86400000;

  function loadJSON(key, fallback) {
    try {
      const raw = store.get(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function loadSettings() {
    const saved = loadJSON('resolveai-settings', {});
    const merged = {};
    Object.keys(DEFAULT_SETTINGS).forEach((k) => { merged[k] = Object.assign({}, DEFAULT_SETTINGS[k], saved && typeof saved[k] === 'object' ? saved[k] : {}); });
    merged.reward.ownerApproval = true; /* mandatory */
    return merged;
  }

  const state = {
    tickets: [],
    customers: { 'Arun Kumar': { rewardCount: 3, rewardAmount: 450 }, 'Priya': { rewardCount: 1, rewardAmount: 150 } },
    ledger: [
      { ticket: 'TKT-1041', customer: 'Priya', amount: 150, status: 'Issued', ts: daysAgo(1) },
      { ticket: 'TKT-1030', customer: 'Rohit Sharma', amount: 200, status: 'Issued', ts: daysAgo(3) },
      { ticket: 'TKT-1027', customer: 'Sneha Rao', amount: 100, status: 'Issued', ts: daysAgo(5) },
      { ticket: 'TKT-1019', customer: 'Gopi Nath', amount: 150, status: 'Blocked', ts: daysAgo(7) },
      { ticket: 'TKT-1012', customer: 'Nisha T', amount: 150, status: 'Rejected', ts: daysAgo(9) },
    ],
    metrics: { priority: { Critical: 2, High: 4, Medium: 9, Low: 8 }, awaiting: 8, resolvedToday: 17 },
    rewardStats: { used: 3450, issued: 23, blocked: 4, issuedWeek: 5 },
    teamStats: {
      'Support Team': { open: 5, resolved: 142, avg: '2h 10m' },
      'Returns & Refunds': { open: 7, resolved: 98, avg: '5h 40m' },
      'Delivery Team': { open: 5, resolved: 76, avg: '8h 05m' },
      'Technical Support': { open: 3, resolved: 41, avg: '3h 25m' },
      'Billing Team': { open: 3, resolved: 64, avg: '4h 15m' },
    },
    settings: loadSettings(),
    rules: loadJSON('resolveai-rules', null) || DEFAULT_RULES.map((r) => Object.assign({}, r)),
    filters: { status: 'all', search: '', page: 1 },
    ui: { analyzing: null, analyzeStep: 0, editingReply: null, replyLang: {}, editingRule: null, confirm: null, createdCount: 0, lastFocus: null },
  };
  if (!Array.isArray(state.rules)) state.rules = DEFAULT_RULES.map((r) => Object.assign({}, r));

  const PAGE_SIZE = 6;
  const FAULT_BASE = { seller: 238, customer: 128, unclear: 46 };
  const TOTAL_TICKETS_BASE = 412;

  function getCustomer(name) {
    if (!state.customers[name]) state.customers[name] = { rewardCount: 0, rewardAmount: 0 };
    return state.customers[name];
  }
  const findTicket = (id) => state.tickets.find((t) => t.id === id);
  function log(t, text, ts) { t.activity.push({ ts: ts || Date.now(), text: text }); }

  function applyAnalysis(t, a) {
    t.analyzed = true;
    t.analysis = a;
    t.priority = a.priority;
    t.team = a.team;
    t.fault = a.fault;
    t.confidence = a.confidence;
    t.replies = { en: a.replies.en, ta: a.replies.ta, tg: a.replies.tg };
  }

  function buildSeedTicket(seed) {
    const t = {
      id: seed.id, customer: seed.customer, order: seed.order, language: seed.language, message: seed.message,
      status: seed.status, analyzed: false, priority: null, team: null, fault: 'pending', confidence: 0,
      analysis: null, replies: null, repeatCount: seed.repeat || 0,
      createdAt: Date.now() - seed.created * 60000, updatedAt: Date.now() - seed.updated * 60000,
      reward: { decision: seed.decision || 'pending' }, activity: [], stepsApplied: false,
    };
    if (seed.analyzed) applyAnalysis(t, buildAnalysis(t));
    const stage = STAGE[t.status];
    const span = t.updatedAt - t.createdAt;
    const at = (i, n) => t.createdAt + Math.round((span * i) / Math.max(1, n));
    log(t, 'Ticket created from customer message', t.createdAt);
    if (t.analyzed) log(t, 'AI analysis completed (simulated)', at(1, 6));
    if (stage >= 1) log(t, 'Assigned to ' + t.team, at(2, 6));
    if (stage >= 2) { log(t, 'Resolution steps applied', at(3, 6)); t.stepsApplied = true; }
    if (stage >= 3) log(t, 'Marked as resolved', at(4, 6));
    if (stage >= 4) log(t, 'Customer confirmed the resolution', at(5, 6));
    if (stage >= 5) log(t, 'Ticket closed', t.updatedAt);
    if (t.reward.decision === 'approved') { t.reward.amount = Math.min(t.analysis.rewardAmount, state.settings.reward.maxReward); log(t, 'Owner approved reward ' + money(t.reward.amount), t.updatedAt); }
    return t;
  }
  state.tickets = SEED_TICKETS.map(buildSeedTicket);

  /* ---------------------------------------------------------
     5. Business logic: transitions & Reward Gate
     --------------------------------------------------------- */
  const stageOf = (t) => STAGE[t.status];

  function setStatus(t, next, note) {
    const prev = t.status;
    if (prev === next) return;
    const wasOpen = OPEN_STATUSES.indexOf(prev) !== -1;
    const isOpen = OPEN_STATUSES.indexOf(next) !== -1;
    if (prev === 'Awaiting Customer') state.metrics.awaiting = Math.max(0, state.metrics.awaiting - 1);
    if (next === 'Awaiting Customer') state.metrics.awaiting += 1;
    if (wasOpen && !isOpen && t.analyzed) {
      state.metrics.priority[t.priority] = Math.max(0, state.metrics.priority[t.priority] - 1);
      const ts = state.teamStats[t.team];
      ts.open = Math.max(0, ts.open - 1);
      ts.resolved += 1;
      state.metrics.resolvedToday += 1;
    }
    t.status = next;
    t.updatedAt = Date.now();
    log(t, note || 'Status changed to ' + next);
  }

  function assignTeam(t, team, silent) {
    if (!t.analyzed || t.team === team) return false;
    const open = OPEN_STATUSES.indexOf(t.status) !== -1;
    if (open) {
      state.teamStats[t.team].open = Math.max(0, state.teamStats[t.team].open - 1);
      state.teamStats[team].open += 1;
    }
    const old = t.team;
    t.team = team;
    t.updatedAt = Date.now();
    log(t, 'Reassigned from ' + old + ' to ' + team);
    if (t.status === 'New') setStatus(t, 'Assigned', 'Assigned to ' + team);
    if (!silent) toast(t.id + ' assigned to ' + team + '.');
    return true;
  }

  /** The Reward Gate: every condition must pass, and the owner must approve. */
  function rewardGate(t) {
    const rs = state.settings.reward;
    const cust = getCustomer(t.customer);
    const sellerFault = t.analyzed && t.fault === 'seller';
    const resolved = stageOf(t) >= 3;
    const confirmed = stageOf(t) >= 4;
    const rawAmount = t.analyzed ? t.analysis.rewardAmount : 0;
    const amount = t.reward.decision === 'approved' && t.reward.amount ? t.reward.amount : Math.min(rawAmount, rs.maxReward);
    const abuseFlag = t.repeatCount >= rs.repeatThreshold;
    const overCount = cust.rewardCount >= rs.customerMonthlyCount;
    const overCustomerCap = cust.rewardAmount + amount > rs.customerMonthlyCap;
    const overBudget = amount > rs.monthlyBudget - state.rewardStats.used;
    const limitsOk = !overCount && !overCustomerCap && !overBudget;
    const decision = t.reward.decision;

    let status; let tone;
    if (decision === 'approved') { status = 'APPROVED'; tone = 'approved'; }
    else if (decision === 'rejected') { status = 'REJECTED'; tone = 'rejected'; }
    else if (!t.analyzed) { status = 'AWAITING AI ANALYSIS'; tone = 'na'; }
    else if (!sellerFault) { status = 'NOT ELIGIBLE – NOT A SELLER FAULT'; tone = 'na'; }
    else if (!resolved) { status = 'WAITING FOR RESOLUTION'; tone = 'waiting'; }
    else if (!confirmed) { status = 'WAITING FOR CUSTOMER CONFIRMATION'; tone = 'waiting'; }
    else if (abuseFlag) { status = 'BLOCKED – ABUSE REVIEW'; tone = 'blocked'; }
    else if (!limitsOk) { status = 'BLOCKED – REWARD LIMIT REACHED'; tone = 'blocked'; }
    else { status = 'WAITING FOR OWNER APPROVAL'; tone = 'waiting'; }

    const canReview = sellerFault && confirmed && decision === 'pending';
    const canApprove = canReview && !abuseFlag && limitsOk && amount > 0;
    return { sellerFault, resolved, confirmed, amount, abuseFlag, overCount, overCustomerCap, overBudget, limitsOk, decision, status, tone, canReview, canApprove, cust, rs };
  }

  function canClose(t) {
    if (t.fault === 'seller' && t.reward.decision === 'pending') return false;
    return true;
  }

  function approveReward(t) {
    const g = rewardGate(t);
    if (!g.canApprove) { toast('The reward gate blocks this reward.', 'error'); return; }
    t.reward.decision = 'approved';
    t.reward.amount = g.amount;
    g.cust.rewardCount += 1;
    g.cust.rewardAmount += g.amount;
    state.rewardStats.used += g.amount;
    state.rewardStats.issued += 1;
    state.rewardStats.issuedWeek += 1;
    state.ledger.unshift({ ticket: t.id, customer: t.customer, amount: g.amount, status: 'Issued', ts: Date.now() });
    t.updatedAt = Date.now();
    log(t, 'Owner approved ' + money(g.amount) + ' coupon (code RAI-' + t.id.replace('TKT-', '') + '-' + g.amount + ')');
    closeModal();
    toast('Reward approved: ' + money(g.amount) + ' coupon for ' + t.customer + '.');
    route();
  }

  function rejectReward(t) {
    const g = rewardGate(t);
    t.reward.decision = 'rejected';
    state.rewardStats.blocked += 1;
    state.ledger.unshift({ ticket: t.id, customer: t.customer, amount: g.amount, status: 'Rejected', ts: Date.now() });
    t.updatedAt = Date.now();
    log(t, 'Owner rejected the reward');
    closeModal();
    toast('Reward rejected for ' + t.id + '.', 'info');
    route();
  }

  /* ---------------------------------------------------------
     6. Theme
     --------------------------------------------------------- */
  const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    store.set('resolveai-theme', theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#1e3a8a');
    updateThemeButtons();
  }
  function updateThemeButtons() {
    const dark = currentTheme() === 'dark';
    $$('[data-action="toggle-theme"]').forEach((b) => {
      b.innerHTML = icon(dark ? 'sun' : 'moon');
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.setAttribute('data-tip', dark ? 'Light mode' : 'Dark mode');
    });
  }
  function themeButton(extra) {
    const dark = currentTheme() === 'dark';
    return '<button type="button" class="btn btn-ghost btn-icon tip-left ' + (extra || '') + '" data-action="toggle-theme" data-tip="' + (dark ? 'Light mode' : 'Dark mode') + '" aria-label="' + (dark ? 'Switch to light mode' : 'Switch to dark mode') + '">' + icon(dark ? 'sun' : 'moon') + '</button>';
  }

  /* ---------------------------------------------------------
     7. Small UI helpers (badges, toast, modal, charts)
     --------------------------------------------------------- */
  const badge = (text, tone, extra) => '<span class="badge badge-' + tone + ' ' + (extra || '') + '">' + esc(text) + '</span>';
  const priorityBadge = (t) => (t.analyzed ? badge(t.priority, t.priority.toLowerCase()) : badge('Pending', 'neutral'));
  const STATUS_TONE = { 'New': 'info', 'Assigned': 'violet', 'In Progress': 'blue', 'Awaiting Customer': 'amber', 'Resolved': 'green', 'Customer Confirmed': 'teal', 'Closed': 'neutral' };
  const statusBadge = (s) => badge(s, STATUS_TONE[s] || 'neutral');
  const FAULT_TONE = { seller: 'critical', customer: 'blue', unclear: 'amber', pending: 'neutral' };
  const faultBadge = (t) => badge(FAULT_LABEL[t.fault], FAULT_TONE[t.fault]);
  const issueLabel = (t) => (t.analyzed ? t.analysis.label : truncate(t.message, 44));
  const ticketTitle = (t) => (t.analyzed ? t.analysis.title.replace('{order}', t.order) : truncate(t.message, 80));

  function toast(message, type, ms) {
    const kind = type || 'success';
    const el = document.createElement('div');
    el.className = 'toast toast-' + kind;
    el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    el.innerHTML = '<span class="icon-lead">' + icon(kind === 'error' ? 'alert' : kind === 'info' ? 'info' : 'check', 18) + '</span><span class="toast-msg">' + esc(message) + '</span><button type="button" class="toast-close" aria-label="Dismiss notification">' + icon('x', 16) + '</button>';
    const remove = () => {
      el.classList.add('leaving');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
    };
    $('.toast-close', el).addEventListener('click', remove);
    toastRoot.appendChild(el);
    while (toastRoot.children.length > 4) toastRoot.removeChild(toastRoot.firstChild);
    setTimeout(remove, ms || 4200);
  }

  function showModal(html, wide) {
    state.ui.lastFocus = document.activeElement;
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal ' + (wide ? 'modal-wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + '</div></div>';
    document.body.classList.add('modal-open');
    const first = $('.modal [data-autofocus]', modalRoot) || $('.modal button, .modal input, .modal select, .modal textarea', modalRoot);
    if (first) first.focus();
  }
  function closeModal() {
    if (!modalRoot.firstChild) return;
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
    state.ui.confirm = null;
    const f = state.ui.lastFocus;
    state.ui.lastFocus = null;
    if (f && document.contains(f) && typeof f.focus === 'function') f.focus();
  }
  function modalHead(title, sub) {
    return '<div class="modal-head"><div><h2 id="modal-title">' + esc(title) + '</h2>' + (sub ? '<p class="card-sub">' + esc(sub) + '</p>' : '') + '</div><button type="button" class="btn btn-ghost btn-icon btn-sm" data-action="modal-close" aria-label="Close dialog">' + icon('x', 18) + '</button></div>';
  }
  function confirmDialog(opts) {
    state.ui.confirm = opts.onConfirm;
    showModal(
      modalHead(opts.title) +
      '<div class="modal-body"><p>' + esc(opts.message) + '</p></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="modal-close">Cancel</button><button type="button" class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-action="modal-confirm" data-autofocus>' + esc(opts.confirmLabel || 'Confirm') + '</button></div>'
    );
    const cancel = $('[data-action="modal-close"].btn-secondary', modalRoot);
    if (cancel) cancel.focus();
  }

  /** Picks a chart maximum that splits into 4 clean tick steps. */
  function niceMax(v) {
    if (!(v > 0)) return 4;
    const cands = [];
    [0.1, 1, 10, 100, 1000, 10000].forEach((p) => [1, 1.5, 2, 2.5, 4, 5, 8].forEach((m) => cands.push(m * p)));
    cands.sort((a, b) => a - b);
    const step = cands.find((s) => s * 4 >= v) || v / 4;
    return step * 4;
  }
  function chartFrame(items, opts) {
    const W = 600; const H = opts.height || 220; const pl = 44; const pr = 14; const pt = 14; const pb = 30;
    const max = niceMax(Math.max.apply(null, items.map((i) => i.value)) * 1.05);
    const iw = W - pl - pr; const ih = H - pt - pb;
    const fmt = opts.format || ((v) => v);
    let grid = '';
    for (let i = 0; i <= 4; i += 1) {
      const y = pt + ih - (ih * i) / 4;
      grid += '<line class="chart-grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '"/><text class="chart-label" x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + fmt(Math.round(((max * i) / 4) * 10) / 10) + '</text>';
    }
    return { W, H, pl, pr, pt, pb, max, iw, ih, fmt, grid };
  }
  function barChart(items, opts) {
    const o = opts || {};
    const f = chartFrame(items, o);
    const step = f.iw / items.length;
    const bw = Math.min(40, step * 0.6);
    const showEvery = items.length > 8 ? 2 : 1;
    const bars = items.map((it, i) => {
      const h = (f.ih * it.value) / f.max;
      const x = f.pl + step * i + (step - bw) / 2;
      const y = f.pt + f.ih - h;
      const label = i % showEvery === 0 ? '<text class="chart-label" x="' + (x + bw / 2) + '" y="' + (f.H - 8) + '" text-anchor="middle">' + esc(it.label) + '</text>' : '';
      return '<g><rect class="chart-bar ' + (o.alt ? 'alt' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="4"><title>' + esc(it.label) + ': ' + esc(f.fmt(it.value)) + '</title></rect>' + label + '</g>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + f.W + ' ' + f.H + '" role="img" aria-label="' + esc(o.label || 'Bar chart') + '">' + f.grid + bars + '</svg>';
  }
  function lineChart(items, opts) {
    const o = opts || {};
    const f = chartFrame(items, o);
    const step = items.length > 1 ? f.iw / (items.length - 1) : 0;
    const pts = items.map((it, i) => ({ x: f.pl + step * i, y: f.pt + f.ih - (f.ih * it.value) / f.max, it: it }));
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const area = line + ' L' + pts[pts.length - 1].x.toFixed(1) + ' ' + (f.pt + f.ih) + ' L' + pts[0].x.toFixed(1) + ' ' + (f.pt + f.ih) + ' Z';
    const dots = pts.map((p) => '<g><circle class="chart-point" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4.5"><title>' + esc(p.it.label) + ': ' + esc(f.fmt(p.it.value)) + '</title></circle><text class="chart-label" x="' + p.x.toFixed(1) + '" y="' + (f.H - 8) + '" text-anchor="middle">' + esc(p.it.label) + '</text></g>').join('');
    return '<svg class="chart" viewBox="0 0 ' + f.W + ' ' + f.H + '" role="img" aria-label="' + esc(o.label || 'Line chart') + '">' + f.grid + '<path class="chart-area" d="' + area + '"/><path class="chart-line" d="' + line + '"/>' + dots + '</svg>';
  }
  function lastDays(n, weekday) {
    const out = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86400000);
      out.push(d.toLocaleDateString('en-IN', weekday ? { weekday: 'short' } : { day: 'numeric', month: 'short' }));
    }
    return out;
  }

  function emptyState(iconName, title, text, actionHtml) {
    return '<div class="empty"><div class="empty-icon">' + icon(iconName, 24) + '</div><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (actionHtml || '') + '</div>';
  }

  function flowStrip(withNote) {
    const steps = [
      ['Ticket', 'inbox', ''], ['AI Analysis', 'bot', ''], ['Fault Check', 'shieldCheck', 'key'], ['Resolution', 'check', ''],
      ['Customer Confirms', 'user', ''], ['Reward Gate', 'lock', 'key'], ['Owner Approval', 'shieldCheck', 'key'], ['Closed', 'check', ''],
    ];
    const html = steps.map((s, i) => '<span class="flow-step ' + s[2] + '">' + icon(s[1], 16) + esc(s[0]) + '</span>' + (i < steps.length - 1 ? '<span class="flow-arrow">' + icon('arrowRight', 14) + '</span>' : '')).join('');
    return '<div class="flow" role="list" aria-label="Ticket workflow">' + html + '</div>' +
      (withNote ? '<p class="flow-note">' + icon('shieldCheck', 18) + '<span><strong>Fault Check → Reward Gate.</strong> A complaint alone never earns a reward. It must be the seller\'s fault, resolved, confirmed by the customer, within abuse limits, and approved by the owner.</span></p>' : '');
  }

  /* ---------------------------------------------------------
     8. Page shell
     --------------------------------------------------------- */
  function shell(active, content) {
    const links = (cls) => NAV.map((n) => '<a class="nav-link ' + (n.key === active ? 'active' : '') + '" href="#/' + n.key + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' + icon(n.icon, 17) + '<span>' + n.label + '</span></a>').join('');
    return '' +
      '<header class="topbar"><div class="topbar-inner">' +
        '<button type="button" class="btn btn-ghost btn-icon menu-btn" data-action="open-drawer" aria-label="Open navigation menu">' + icon('menu') + '</button>' +
        '<a class="brand" href="#/dashboard" aria-label="ResolveAI home">' + logoMark() + '<span>ResolveAI</span></a>' +
        '<nav class="nav-desktop" aria-label="Primary">' + links() + '</nav>' +
        '<div class="topbar-actions">' + themeButton() +
          '<div class="profile">' +
            '<button type="button" class="profile-btn" data-action="toggle-profile" aria-haspopup="true" aria-expanded="false" aria-controls="profile-menu"><span class="avatar" aria-hidden="true">VA</span><span class="profile-name">Vijay Anand</span>' + icon('chevronDown', 16) + '</button>' +
            '<div class="dropdown" id="profile-menu" hidden>' +
              '<div class="dropdown-head"><strong>Vijay Anand</strong><div class="muted small">Owner · ' + esc(state.settings.business.name) + '</div></div>' +
              '<a class="dropdown-item" href="#/settings">' + icon('settings', 16) + 'Settings</a>' +
              '<button type="button" class="dropdown-item" data-action="logout">' + icon('logout', 16) + 'Sign out</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div></header>' +
      '<div class="drawer-backdrop" data-action="close-drawer"></div>' +
      '<aside class="drawer" id="drawer" aria-label="Mobile navigation">' +
        '<div class="drawer-head"><a class="brand" href="#/dashboard">' + logoMark() + '<span>ResolveAI</span></a><button type="button" class="btn btn-ghost btn-icon btn-sm" data-action="close-drawer" aria-label="Close navigation menu">' + icon('x') + '</button></div>' +
        links() +
        '<div class="drawer-foot"><button type="button" class="btn btn-secondary btn-block" data-action="logout">' + icon('logout', 16) + 'Sign out</button></div>' +
      '</aside>' +
      '<main id="main" class="container" tabindex="-1">' + content + '</main>';
  }

  /* ---------------------------------------------------------
     9. Pages
     --------------------------------------------------------- */

  /* ----- Login ----- */
  function pageLogin() {
    const remembered = store.get('resolveai-email') || '';
    return '' +
      '<div class="login">' +
        '<section class="login-brand">' +
          '<a class="brand" href="#/login">' + logoMark() + '<span>ResolveAI</span></a>' +
          '<div><h1>Resolve tickets faster. Reward only when it\'s deserved.</h1>' +
          '<p>AI-assisted support triage for small sellers, with a reward workflow that cannot be gamed.</p>' +
          '<ul class="login-points">' +
            '<li>' + icon('check') + '<span>Priority, team routing and fault check on every ticket</span></li>' +
            '<li>' + icon('check') + '<span>Understands Tanglish and replies in English, Tamil or Tanglish</span></li>' +
            '<li>' + icon('check') + '<span>Capped, owner-approved rewards with abuse limits</span></li></ul></div>' +
          '<div class="login-gate"><strong>Fault Check → Reward Gate</strong>Rewards are released only after fault is confirmed, the issue is resolved, the customer confirms, and the owner approves.</div>' +
        '</section>' +
        '<section class="login-main">' +
          '<div class="login-theme">' + themeButton() + '</div>' +
          '<div class="login-card">' +
            '<h2>Welcome back</h2><p class="muted mt-sm">Sign in to your support workspace.</p>' +
            '<form id="login-form" class="stack-sm mt" novalidate>' +
              '<div class="field"><label for="email">Email</label><div class="input-icon">' + icon('mail', 16) + '<input class="input" id="email" name="email" type="email" autocomplete="email" placeholder="you@business.com" value="' + esc(remembered) + '" /></div><div class="field-error" id="email-error" role="alert"></div></div>' +
              '<div class="field"><label for="password">Password</label><div class="input-affix"><input class="input" id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" /><button type="button" class="btn btn-ghost btn-icon btn-sm affix-btn" data-action="toggle-password" aria-label="Show password">' + icon('eye', 16) + '</button></div><div class="field-error" id="password-error" role="alert"></div></div>' +
              '<div class="row-between"><label class="check"><input type="checkbox" name="remember" ' + (remembered ? 'checked' : '') + ' /> Remember me</label><button type="button" class="btn btn-ghost btn-sm" data-action="forgot-password">Forgot password?</button></div>' +
              '<button type="submit" class="btn btn-primary btn-lg btn-block" id="login-btn">Log in</button>' +
            '</form>' +
            '<div class="divider">or</div>' +
            '<button type="button" class="btn btn-secondary btn-lg btn-block" data-action="login-demo">' + icon('sparkles', 16) + 'Use demo login</button>' +
            '<p class="demo-note">Demo build: no real accounts or AI. Any valid email and password works.</p>' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function doLogin(email, remember) {
    store.sset('resolveai-auth', '1');
    if (remember) { store.set('resolveai-auth', '1'); store.set('resolveai-email', email); }
    else { store.del('resolveai-auth'); store.del('resolveai-email'); }
    location.hash = '#/dashboard';
  }
  function isAuthed() { return store.get('resolveai-auth') === '1' || store.sget('resolveai-auth') === '1'; }
  function logout() {
    store.del('resolveai-auth'); store.sdel('resolveai-auth');
    toast('You have been signed out.', 'info');
    location.hash = '#/login';
  }

  /* ----- Dashboard ----- */
  function kpiValues() {
    const m = state.metrics;
    const pending = state.tickets.filter((t) => !t.analyzed && OPEN_STATUSES.indexOf(t.status) !== -1).length;
    const sum = m.priority.Critical + m.priority.High + m.priority.Medium + m.priority.Low;
    return { open: sum + pending, high: m.priority.Critical + m.priority.High, awaiting: m.awaiting, resolvedToday: m.resolvedToday, rewards: state.rewardStats.issuedWeek };
  }

  function ticketsTable(list, variant) {
    const rows = list.map((t) =>
      '<tr data-href="#/tickets/' + esc(t.id) + '">' +
        '<td><a class="id-link mono" href="#/tickets/' + esc(t.id) + '">#' + esc(t.id) + '</a></td>' +
        '<td>' + esc(t.customer) + (t.language === 'Tanglish' ? '<div class="cell-sub">Tanglish</div>' : '') + '</td>' +
        '<td class="cell-issue">' + esc(issueLabel(t)) + '</td>' +
        '<td>' + priorityBadge(t) + '</td>' +
        '<td>' + (t.team ? esc(t.team) : '<span class="muted">Unassigned</span>') + '</td>' +
        '<td>' + faultBadge(t) + '</td>' +
        '<td>' + statusBadge(t.status) + '</td>' +
        '<td class="nowrap muted">' + esc(formatAgo(variant === 'dashboard' ? t.createdAt : t.updatedAt)) + '</td>' +
      '</tr>').join('');
    return '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Ticket ID</th><th scope="col">Customer</th><th scope="col">Issue</th><th scope="col">Priority</th><th scope="col">' + (variant === 'dashboard' ? 'Team' : 'Assigned Team') + '</th><th scope="col">' + (variant === 'dashboard' ? 'Fault Detection' : 'Fault') + '</th><th scope="col">Status</th><th scope="col">' + (variant === 'dashboard' ? 'Created' : 'Last Updated') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function pageDashboard() {
    const k = kpiValues();
    const cards = [
      { label: 'Open Tickets', value: k.open, icon: 'inbox', href: '#/tickets?filter=all', tone: 'blue' },
      { label: 'High Priority', value: k.high, icon: 'alert', href: '#/tickets?filter=high', tone: 'red' },
      { label: 'Awaiting Customer', value: k.awaiting, icon: 'clock', href: '#/tickets?filter=awaiting', tone: 'amber' },
      { label: 'Resolved Today', value: k.resolvedToday, icon: 'check', href: '#/tickets?filter=resolved', tone: 'green' },
      { label: 'Rewards Issued', value: k.rewards, icon: 'gift', href: '#/rewards', tone: 'violet', hint: 'this week' },
    ].map((c) => '<a class="card card-link kpi" href="' + c.href + '"><div class="kpi-top"><span>' + c.label + '</span><span class="kpi-icon tone-' + c.tone + '">' + icon(c.icon, 18) + '</span></div><div class="kpi-value">' + c.value + '</div>' + (c.hint ? '<div class="muted small">' + c.hint + '</div>' : '<div class="muted small">View tickets</div>') + '</a>').join('');

    const vol = [14, 19, 16, 22, 18, 25, 21];
    const volItems = lastDays(7, true).map((l, i) => ({ label: l, value: vol[i] }));
    const pr = state.metrics.priority;
    const totalPr = pr.Critical + pr.High + pr.Medium + pr.Low || 1;
    const prRows = ['Critical', 'High', 'Medium', 'Low'].map((p) => '<div class="bar-row"><span>' + p + '</span><div class="progress bar-' + p.toLowerCase() + '" role="progressbar" aria-label="' + p + ' share" aria-valuenow="' + pct(pr[p], totalPr) + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct(pr[p], totalPr) + '%"></span></div><strong>' + pr[p] + '</strong></div>').join('');

    const recent = state.tickets.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    const pending = state.tickets.filter((t) => rewardGate(t).status === 'WAITING FOR OWNER APPROVAL');
    const pendingHtml = pending.length
      ? '<ul class="list-plain">' + pending.map((t) => '<li class="list-item"><div><strong class="mono">' + esc(t.id) + '</strong> · ' + esc(t.customer) + '<div class="cell-sub">' + esc(issueLabel(t)) + ' · suggested ' + money(rewardGate(t).amount) + '</div></div><a class="btn btn-secondary btn-sm" href="#/tickets/' + esc(t.id) + '">Review</a></li>').join('') + '</ul>'
      : emptyState('shieldCheck', 'No rewards waiting', 'When a seller-fault ticket is confirmed by the customer, it will appear here for your approval.');

    return '' +
      '<div class="page-head"><div><h1>Dashboard</h1><p>' + esc(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + ' · ' + esc(state.settings.business.name) + '</p></div>' +
        '<div class="head-actions"><button type="button" class="btn btn-primary" data-action="new-ticket">' + icon('plus', 16) + 'New ticket</button></div></div>' +
      '<section class="card card-pad" aria-label="Workflow"><div class="section-title">How every ticket flows</div>' + flowStrip(true) + '</section>' +
      '<section class="grid grid-kpi mt" aria-label="Key metrics">' + cards + '</section>' +
      '<section class="grid grid-main-side mt">' +
        '<div class="card"><div class="card-head"><div><h2>Ticket overview</h2><div class="card-sub">Tickets received in the last 7 days</div></div></div><div class="card-body">' + barChart(volItems, { label: 'Ticket volume over the last 7 days' }) + '</div></div>' +
        '<div class="card"><div class="card-head"><div><h2>Priority distribution</h2><div class="card-sub">Open tickets by priority</div></div></div><div class="card-body stack-sm">' + prRows + '</div></div>' +
      '</section>' +
      '<section class="grid grid-main-side mt">' +
        '<div class="card"><div class="card-head"><h2>Recent tickets</h2><a class="btn btn-ghost btn-sm" href="#/tickets">View all ' + icon('arrowRight', 14) + '</a></div>' + ticketsTable(recent, 'dashboard') + '</div>' +
        '<div class="card"><div class="card-head"><h2>' + icon('gift', 18) + 'Waiting for your approval</h2></div><div class="card-body">' + pendingHtml + '</div></div>' +
      '</section>';
  }

  /* ----- Tickets list ----- */
  const FILTERS = [
    { key: 'all', label: 'All', test: () => true },
    { key: 'new', label: 'New', test: (t) => t.status === 'New' },
    { key: 'high', label: 'High Priority', test: (t) => t.analyzed && (t.priority === 'High' || t.priority === 'Critical') && OPEN_STATUSES.indexOf(t.status) !== -1 },
    { key: 'assigned', label: 'Assigned', test: (t) => t.status === 'Assigned' },
    { key: 'progress', label: 'In Progress', test: (t) => t.status === 'In Progress' },
    { key: 'awaiting', label: 'Awaiting Customer', test: (t) => t.status === 'Awaiting Customer' },
    { key: 'resolved', label: 'Resolved', test: (t) => t.status === 'Resolved' || t.status === 'Customer Confirmed' },
    { key: 'closed', label: 'Closed', test: (t) => t.status === 'Closed' },
  ];

  function filteredTickets() {
    const f = FILTERS.find((x) => x.key === state.filters.status) || FILTERS[0];
    const q = state.filters.search.trim().toLowerCase();
    return state.tickets
      .filter(f.test)
      .filter((t) => !q || [t.id, t.customer, issueLabel(t), t.message, t.team || '', t.status].join(' ').toLowerCase().indexOf(q) !== -1)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  function filtersHtml() {
    return '<div class="filter-list" role="group" aria-label="Ticket filters">' + FILTERS.map((f) => {
      const count = state.tickets.filter(f.test).length;
      const active = f.key === state.filters.status;
      return '<button type="button" class="filter-item ' + (active ? 'active' : '') + '" data-action="filter" data-filter="' + f.key + '" aria-pressed="' + active + '"><span>' + f.label + '</span><span class="filter-count">' + count + '</span></button>';
    }).join('') + '</div>';
  }
  function resultsHtml() {
    const list = filteredTickets();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.filters.page > pages) state.filters.page = pages;
    const start = (state.filters.page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    if (!list.length) {
      return emptyState('search', 'No tickets found', state.filters.search ? 'Nothing matches "' + state.filters.search + '". Try a different search or filter.' : 'There are no tickets in this view yet.', '<button type="button" class="btn btn-secondary" data-action="clear-filters">Clear filters</button>');
    }
    let pageBtns = '';
    for (let p = 1; p <= pages; p += 1) pageBtns += '<button type="button" class="page-btn ' + (p === state.filters.page ? 'active' : '') + '" data-action="page" data-page="' + p + '" aria-label="Page ' + p + '"' + (p === state.filters.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
    return ticketsTable(slice, 'tickets') +
      '<div class="pagination"><span class="muted small">Showing ' + (start + 1) + '–' + (start + slice.length) + ' of ' + list.length + ' tickets</span><div class="pages">' +
      '<button type="button" class="page-btn" data-action="page" data-page="' + (state.filters.page - 1) + '" aria-label="Previous page"' + (state.filters.page <= 1 ? ' disabled' : '') + '>' + icon('chevronLeft', 16) + '</button>' + pageBtns +
      '<button type="button" class="page-btn" data-action="page" data-page="' + (state.filters.page + 1) + '" aria-label="Next page"' + (state.filters.page >= pages ? ' disabled' : '') + '>' + icon('chevronRight', 16) + '</button></div></div>';
  }
  function refreshTickets() {
    const f = $('#tickets-filters'); const r = $('#tickets-results');
    if (f) f.innerHTML = filtersHtml();
    if (r) r.innerHTML = resultsHtml();
  }
  function pageTickets(params) {
    if (params.filter && FILTERS.some((f) => f.key === params.filter)) { state.filters.status = params.filter; state.filters.page = 1; }
    return '' +
      '<div class="page-head"><div><h1>Tickets</h1><p>Search, filter and open any ticket to see AI analysis, fault check and reward status.</p></div>' +
        '<div class="head-actions"><button type="button" class="btn btn-primary" data-action="new-ticket">' + icon('plus', 16) + 'New ticket</button></div></div>' +
      '<div class="tickets-layout">' +
        '<aside class="card" aria-label="Filters"><div id="tickets-filters">' + filtersHtml() + '</div></aside>' +
        '<section class="stack-sm">' +
          '<div class="input-icon">' + icon('search', 16) + '<input class="input" id="ticket-search" type="search" placeholder="Search tickets..." aria-label="Search tickets" value="' + esc(state.filters.search) + '" autocomplete="off" /></div>' +
          '<div class="card" id="tickets-results">' + resultsHtml() + '</div>' +
        '</section>' +
      '</div>';
  }

  /* ----- Ticket detail ----- */
  function nextAction(t) {
    if (!t.analyzed) return null;
    switch (t.status) {
      case 'New': return { label: 'Assign to ' + t.team, icon: 'users', action: 'advance' };
      case 'Assigned': return { label: 'Start work', icon: 'arrowRight', action: 'advance' };
      case 'In Progress': return { label: 'Mark resolved', icon: 'check', action: 'advance' };
      case 'Awaiting Customer': return { label: 'Customer replied', icon: 'inbox', action: 'resume' };
      case 'Resolved': return { label: 'Simulate customer confirmation', icon: 'check', action: 'advance', tip: 'In production the customer confirms via a link or reply. This button simulates it for the demo.' };
      case 'Customer Confirmed':
        return canClose(t)
          ? { label: 'Close ticket', icon: 'check', action: 'close' }
          : { label: 'Close ticket', icon: 'lock', action: 'close', disabled: true, tip: 'Review the reward first. The owner must approve or reject it before closing.' };
      default: return null;
    }
  }

  function gatePipeline(t, g) {
    const items = [];
    const faultState = !t.analyzed ? 'pending' : g.sellerFault ? 'pass' : 'fail';
    const skipped = faultState === 'fail';
    items.push({ label: 'Fault Check', state: faultState, text: faultState === 'pass' ? 'Seller fault' : faultState === 'fail' ? 'Not seller' : 'Pending' });
    items.push({ label: 'Issue resolved', state: skipped ? 'skip' : g.resolved ? 'pass' : 'pending', text: skipped ? 'Skipped' : g.resolved ? 'Yes' : 'Pending' });
    items.push({ label: 'Customer confirmed', state: skipped ? 'skip' : g.confirmed ? 'pass' : 'pending', text: skipped ? 'Skipped' : g.confirmed ? 'Yes' : 'Pending' });
    const abuseState = skipped ? 'skip' : !g.confirmed ? 'pending' : g.abuseFlag || !g.limitsOk ? 'fail' : 'pass';
    items.push({ label: 'Abuse & limit check', state: abuseState, text: abuseState === 'skip' ? 'Skipped' : abuseState === 'pending' ? 'Pending' : abuseState === 'pass' ? 'Passed' : 'Blocked' });
    const ownerState = g.decision === 'approved' ? 'pass' : g.decision === 'rejected' ? 'fail' : skipped ? 'skip' : 'pending';
    items.push({ label: 'Owner approval', state: ownerState, text: g.decision === 'approved' ? 'Approved' : g.decision === 'rejected' ? 'Rejected' : ownerState === 'skip' ? 'Skipped' : 'Pending' });
    return '<div class="gate-pipeline">' + items.map((it) => '<div class="gate-item ' + it.state + '"><span class="gate-mark">' + (it.state === 'pass' ? icon('check', 14) : it.state === 'fail' ? icon('x', 14) : '') + '</span><span>' + it.label + '</span><span class="gate-state">' + it.text + '</span></div>').join('') + '</div>';
  }

  function rewardCard(t) {
    const g = gatePipelineData(t);
    const rs = g.rs;
    const yn = (v) => (v ? '<strong class="yes">YES</strong>' : '<strong class="no">NO</strong>');
    const ownerTxt = g.decision === 'approved' ? '<strong class="yes">APPROVED</strong>' : g.decision === 'rejected' ? '<strong class="no">REJECTED</strong>' : g.sellerFault ? '<strong class="wait">PENDING</strong>' : '<strong class="muted">N/A</strong>';
    const statusCls = { approved: 'rs-approved', rejected: 'rs-rejected', blocked: 'rs-blocked', waiting: 'rs-waiting', na: 'rs-na' }[g.tone];
    let button;
    if (g.decision === 'approved') {
      button = '<div class="notice notice-ok mt-sm">' + icon('check', 18) + '<span>' + money(t.reward.amount) + ' coupon approved by the owner. Code <strong class="mono">RAI-' + esc(t.id.replace('TKT-', '')) + '-' + t.reward.amount + '</strong></span></div>';
    } else if (g.decision === 'rejected') {
      button = '<div class="notice notice-bad mt-sm">' + icon('x', 18) + '<span>The owner rejected the reward for this ticket.</span></div>';
    } else if (g.canReview) {
      button = '<button type="button" class="btn btn-primary btn-block mt-sm" data-action="review-reward" data-id="' + esc(t.id) + '">' + icon('gift', 16) + 'Review Reward</button>';
    } else {
      const tip = !t.analyzed ? 'Analyze the ticket first.' : !g.sellerFault ? 'Rewards are only possible for seller-fault tickets.' : 'Available once the customer confirms the resolution.';
      button = '<span class="tip-wrap" style="display:flex" data-tip="' + esc(tip) + '"><button type="button" class="btn btn-primary btn-block mt-sm" disabled>' + icon('lock', 16) + 'Review Reward</button></span>';
    }
    return '<section class="card card-highlight" aria-labelledby="reward-h"><div class="card-head"><h2 id="reward-h">' + icon('gift', 18) + 'Reward Eligibility</h2><span class="pill-demo">Reward Gate</span></div><div class="card-body">' +
      gatePipeline(t, g) +
      '<div class="dl">' +
        '<div class="dl-row"><span>Seller Fault</span>' + (t.analyzed ? yn(g.sellerFault) : '<strong class="muted">PENDING</strong>') + '</div>' +
        '<div class="dl-row"><span>Issue Resolved</span>' + yn(g.resolved) + '</div>' +
        '<div class="dl-row"><span>Customer Confirmed</span>' + yn(g.confirmed) + '</div>' +
        '<div class="dl-row"><span>Owner Approval</span>' + ownerTxt + '</div>' +
        '<div class="dl-row"><span>Monthly Reward Limit</span><strong>' + g.cust.rewardCount + ' / ' + rs.customerMonthlyCount + '</strong></div>' +
        '<div class="dl-row"><span>Repeat Complaint Count</span><strong class="' + (g.abuseFlag ? 'no' : '') + '">' + t.repeatCount + ' / ' + rs.repeatThreshold + '</strong></div>' +
      '</div>' +
      '<div class="reward-status ' + statusCls + '">' + icon(g.tone === 'approved' ? 'check' : g.tone === 'blocked' || g.tone === 'rejected' ? 'alert' : 'shieldCheck', 18) + '<span>Reward Status: ' + esc(g.status) + '</span></div>' +
      button +
      '<p class="muted small mt-sm">Rewards are never released automatically. Owner approval is mandatory.</p>' +
    '</div></section>';
  }
  function gatePipelineData(t) { return rewardGate(t); }

  function analysisCard(t) {
    if (state.ui.analyzing === t.id) {
      const cur = state.ui.analyzeStep;
      return '<section class="card" aria-live="polite"><div class="card-head"><h2>' + icon('bot', 18) + 'AI Analysis</h2><span class="pill-demo">Demo · simulated</span></div><div class="card-body"><div class="analyzing"><strong>Analyzing ticket...</strong>' +
        ANALYSIS_STEPS.map((s, i) => '<div class="analyze-step ' + (i < cur ? 'done' : i === cur ? 'current' : '') + '"><span class="analyze-mark">' + (i < cur ? icon('check', 16) : i === cur ? '<span class="spinner"></span>' : icon('clock', 14)) + '</span>' + s + '</div>').join('') +
        '</div></div></section>';
    }
    if (!t.analyzed) {
      return '<section class="card"><div class="card-head"><h2>' + icon('bot', 18) + 'AI Analysis</h2><span class="pill-demo">Demo · simulated</span></div><div class="card-body">' +
        emptyState('sparkles', 'Not analyzed yet', 'Run the simulated analysis to classify priority, detect the team, check fault, suggest steps and draft a reply.', '<button type="button" class="btn btn-primary" data-action="analyze" data-id="' + esc(t.id) + '">' + icon('sparkles', 16) + 'Analyze Ticket</button>') +
        '</div></section>';
    }
    const a = t.analysis;
    const lowConf = t.confidence < state.settings.ai.reviewBelow || t.fault === 'unclear';
    const faultCls = 'fault-' + t.fault;
    const faultHeadline = t.fault === 'seller' ? 'SELLER FAULT' : t.fault === 'customer' ? 'CUSTOMER FAULT' : 'NEEDS REVIEW';
    return '<section class="card"><div class="card-head"><h2>' + icon('bot', 18) + 'AI Analysis</h2><span class="pill-demo">Demo · simulated</span></div><div class="card-body stack-sm">' +
      '<div class="grid grid-2">' +
        '<div class="insight"><div class="insight-label">Priority</div><div class="insight-value">' + priorityBadge(t) + '</div><p><strong>Reason:</strong> ' + esc(a.priorityReason) + '</p></div>' +
        '<div class="insight"><div class="insight-label">Responsible team</div><div class="insight-value">' + esc(t.team) + '</div><p>' + esc(a.teamReason) + '</p></div>' +
      '</div>' +
      '<div class="insight fault-card ' + faultCls + '"><div class="insight-label">' + icon('shieldCheck', 14) + 'Fault detection · core of Fault Check → Reward Gate</div>' +
        '<div class="insight-value">' + faultHeadline + '</div>' +
        '<div class="confidence"><span class="small muted">Confidence</span><div class="progress" role="progressbar" aria-label="Confidence" aria-valuenow="' + t.confidence + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + t.confidence + '%"></span></div><strong>' + t.confidence + '%</strong></div>' +
        '<p><strong>Reason:</strong> ' + esc(a.faultReason) + '</p></div>' +
      (lowConf ? '<div class="notice notice-warn">' + icon('alert', 18) + '<span>' + (t.fault === 'unclear' ? 'Responsibility is unclear, so a person should review this ticket.' : 'Confidence is below your review threshold (' + state.settings.ai.reviewBelow + '%). Please double-check before acting.') + '</span></div>' : '') +
    '</div></section>';
  }

  function resolutionCard(t) {
    if (!t.analyzed) {
      return '<section class="card"><div class="card-head"><h2>' + icon('check', 18) + 'AI Suggested Resolution</h2></div><div class="card-body"><p class="muted">Suggested steps appear after the ticket is analyzed.</p></div></section>';
    }
    const done = t.stepsApplied;
    const canApply = !done && (t.status === 'New' || t.status === 'Assigned');
    return '<section class="card"><div class="card-head"><h2>' + icon('check', 18) + 'AI Suggested Resolution</h2><span class="pill-demo">Demo · simulated</span></div><div class="card-body stack-sm">' +
      '<ol class="steps">' + t.analysis.steps.map((s) => '<li class="' + (done ? 'done' : '') + '"><span>' + esc(s) + '</span></li>').join('') + '</ol>' +
      '<div class="row">' + (done
        ? '<span class="badge badge-green">' + icon('check', 12) + 'Steps applied</span>'
        : '<span class="tip-wrap" data-tip="' + (canApply ? 'Moves the ticket to In Progress' : 'Only available while the ticket is New or Assigned') + '"><button type="button" class="btn btn-primary" data-action="apply-steps" data-id="' + esc(t.id) + '"' + (canApply ? '' : ' disabled') + '>Apply Resolution Steps</button></span>') + '</div>' +
    '</div></section>';
  }

  function replyCard(t) {
    if (!t.analyzed) {
      return '<section class="card"><div class="card-head"><h2>' + icon('mail', 18) + 'AI Reply Draft</h2></div><div class="card-body"><p class="muted">A reply draft in English, Tamil or Tanglish appears after analysis.</p></div></section>';
    }
    const lang = state.ui.replyLang[t.id] || (t.language === 'Tamil' ? 'ta' : t.language === 'Tanglish' ? 'tg' : state.settings.language.defaultReply);
    const text = t.replies[lang];
    const editing = state.ui.editingReply === t.id;
    const closed = t.status === 'Closed';
    return '<section class="card"><div class="card-head"><h2>' + icon('mail', 18) + 'AI Reply Draft</h2>' +
      '<div class="row"><label class="small muted" for="reply-lang">' + icon('languages', 14) + ' Language</label><select class="select" id="reply-lang" data-action="reply-lang" data-id="' + esc(t.id) + '" style="width:auto;min-height:34px;padding:4px 10px">' + Object.keys(LANGS).map((k) => '<option value="' + k + '"' + (k === lang ? ' selected' : '') + '>' + LANGS[k] + '</option>').join('') + '</select></div></div>' +
      '<div class="card-body stack-sm">' +
        (t.language !== 'English' ? '<div class="notice notice-info">' + icon('languages', 18) + '<span><strong>AI interpretation:</strong> ' + esc(t.analysis.interpretation) + '</span></div>' : '') +
        (editing
          ? '<textarea class="textarea" id="reply-text" aria-label="Edit reply" rows="5" data-id="' + esc(t.id) + '" data-lang="' + lang + '" lang="' + (lang === 'ta' ? 'ta' : 'en') + '">' + esc(text) + '</textarea>'
          : '<div class="reply-box" lang="' + (lang === 'ta' ? 'ta' : 'en') + '">' + esc(text) + '</div>') +
        '<div class="row">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="copy-reply" data-id="' + esc(t.id) + '">' + icon('copy', 15) + 'Copy Reply</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="edit-reply" data-id="' + esc(t.id) + '">' + icon(editing ? 'check' : 'edit', 15) + (editing ? 'Done' : 'Edit') + '</button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="send-reply" data-id="' + esc(t.id) + '"' + (closed ? ' disabled' : '') + '>' + icon('send', 15) + 'Send</button>' +
        '</div>' +
        '<p class="muted small">Drafts are generated by the demo engine. Review before sending.</p>' +
      '</div></section>';
  }

  function lifecycleCard(t) {
    const cur = stageOf(t);
    return '<section class="card card-pad" aria-label="Ticket lifecycle"><div class="section-title">Ticket lifecycle</div><ol class="lifecycle">' +
      LIFECYCLE.map((s, i) => '<li class="life-step ' + (i < cur ? 'done' : i === cur ? 'current' : '') + '"' + (i === cur ? ' aria-current="step"' : '') + '><span class="life-dot">' + (i < cur ? icon('check', 15) : i + 1) + '</span><span>' + s + '</span></li>').join('') + '</ol>' +
      (t.status === 'Awaiting Customer' ? '<p class="life-note">Currently waiting for the customer to reply.</p>' : '') + '</section>';
  }

  function activityCard(t) {
    const items = t.activity.slice().sort((a, b) => b.ts - a.ts);
    return '<section class="card"><div class="card-head"><h2>' + icon('clock', 18) + 'Activity</h2></div><div class="card-body"><ul class="activity">' +
      items.map((a) => '<li><div><div>' + esc(a.text) + '</div><div class="muted small">' + esc(formatDate(a.ts) + ', ' + formatTime(a.ts)) + '</div></div></li>').join('') + '</ul></div></section>';
  }

  function pageTicketDetail(id) {
    const t = findTicket(id);
    if (!t) return notFound('Ticket not found', 'We could not find ticket "' + id + '".', '#/tickets', 'Back to tickets');
    const na = nextAction(t);
    const busy = state.ui.analyzing === t.id;
    let actionBtn = '';
    if (!t.analyzed) {
      actionBtn = '<button type="button" class="btn btn-primary" data-action="analyze" data-id="' + esc(t.id) + '"' + (busy ? ' disabled' : '') + '>' + (busy ? '<span class="spinner"></span>Analyzing ticket...' : icon('sparkles', 16) + 'Analyze Ticket') + '</button>';
    } else if (na) {
      const btn = '<button type="button" class="btn btn-primary" data-action="' + na.action + '" data-id="' + esc(t.id) + '"' + (na.disabled ? ' disabled' : '') + '>' + icon(na.icon, 16) + esc(na.label) + '</button>';
      actionBtn = na.tip ? '<span class="tip-wrap tip-left" data-tip="' + esc(na.tip) + '">' + btn + '</span>' : btn;
    }
    const waitBtn = t.analyzed && t.status === 'In Progress'
      ? '<button type="button" class="btn btn-secondary" data-action="wait-customer" data-id="' + esc(t.id) + '">' + icon('clock', 16) + 'Wait for customer</button>' : '';
    const teamSelect = t.analyzed && OPEN_STATUSES.indexOf(t.status) !== -1
      ? '<div class="row"><label class="small muted" for="detail-team">Assigned team</label><select class="select" id="detail-team" data-action="detail-team" data-id="' + esc(t.id) + '" style="width:auto;min-height:34px;padding:4px 10px">' + TEAMS.map((tm) => '<option' + (tm.name === t.team ? ' selected' : '') + '>' + esc(tm.name) + '</option>').join('') + '</select></div>' : '';

    return '' +
      '<div class="detail-head">' +
        '<a class="back-link" href="#/tickets">' + icon('chevronLeft', 16) + 'All tickets</a>' +
        '<div class="row-between"><div style="min-width:0"><div class="mono muted">' + esc(t.id) + '</div><h1 class="detail-title">' + esc(ticketTitle(t)) + '</h1>' +
          '<div class="meta-row">' + priorityBadge(t) + statusBadge(t.status) + faultBadge(t) + '<span class="muted small">' + icon('user', 13) + ' ' + esc(t.customer) + ' · Updated ' + esc(formatAgo(t.updatedAt)) + '</span></div></div>' +
          '<div class="head-actions">' + teamSelect + waitBtn + actionBtn + '</div></div>' +
      '</div>' +
      lifecycleCard(t) +
      '<div class="grid grid-main-side mt">' +
        '<div class="stack">' +
          '<section class="card"><div class="card-head"><h2>' + icon('mail', 18) + 'Customer message</h2><div class="row">' + (t.language === 'Tanglish' ? badge('Tanglish detected', 'violet') : badge(t.language, 'neutral')) + '</div></div><div class="card-body stack-sm">' +
            '<dl class="kv"><dt>Customer</dt><dd>' + esc(t.customer) + '</dd><dt>Language</dt><dd>' + esc(t.language) + '</dd><dt>Order</dt><dd class="mono">' + esc(t.order) + '</dd></dl>' +
            '<blockquote class="quote" style="margin:0" lang="' + (t.language === 'Tamil' ? 'ta' : 'en') + '">' + esc('"' + t.message + '"') + '</blockquote></div></section>' +
          analysisCard(t) + resolutionCard(t) + replyCard(t) +
        '</div>' +
        '<div class="stack">' + rewardCard(t) + activityCard(t) + '</div>' +
      '</div>';
  }

  /* ----- Teams ----- */
  function pageTeams() {
    const cards = TEAMS.map((tm) => {
      const s = state.teamStats[tm.name];
      return '<article class="card team-card"><div class="team-top"><span class="kpi-icon tone-blue">' + icon(tm.icon, 18) + '</span><div><h2 style="font-size:16px">' + esc(tm.name) + '</h2><div class="muted small">Lead: ' + esc(tm.lead) + ' · ' + tm.members + ' members</div></div></div><p class="muted">' + esc(tm.blurb) + '</p>' +
        '<div class="team-stats"><div class="team-stat"><strong>' + s.open + '</strong><span>Open</span></div><div class="team-stat"><strong>' + s.resolved + '</strong><span>Resolved</span></div><div class="team-stat"><strong>' + esc(s.avg) + '</strong><span>Avg time</span></div></div></article>';
    }).join('');
    const assignable = state.tickets.filter((t) => OPEN_STATUSES.indexOf(t.status) !== -1);
    const options = assignable.length
      ? assignable.map((t) => '<option value="' + esc(t.id) + '"' + (t.analyzed ? '' : ' disabled') + '>' + esc(t.id + ' · ' + t.customer + ' · ' + (t.analyzed ? issueLabel(t) : 'needs analysis first')) + '</option>').join('')
      : '<option value="">No open tickets</option>';
    return '' +
      '<div class="page-head"><div><h1>Teams</h1><p>Workload and resolution speed for each support team.</p></div></div>' +
      '<section class="grid grid-3" aria-label="Teams">' + cards + '</section>' +
      '<section class="card mt"><div class="card-head"><div><h2>' + icon('users', 18) + 'Assign a ticket</h2><div class="card-sub">Move an open, analyzed ticket to a different team.</div></div></div><div class="card-body">' +
        '<form id="assign-form" class="form-grid" novalidate><div class="field"><label for="assign-ticket">Ticket</label><select class="select" id="assign-ticket" name="ticket">' + options + '</select></div>' +
        '<div class="field"><label for="assign-team">Team</label><select class="select" id="assign-team" name="team">' + TEAMS.map((tm) => '<option>' + esc(tm.name) + '</option>').join('') + '</select></div>' +
        '<div class="full"><button type="submit" class="btn btn-primary"' + (assignable.some((t) => t.analyzed) ? '' : ' disabled') + '>Assign ticket</button></div></form></div></section>';
  }

  /* ----- Rewards ----- */
  function pageRewards() {
    const rs = state.settings.reward; const st = state.rewardStats;
    const remaining = Math.max(0, rs.monthlyBudget - st.used);
    const usedPct = Math.min(100, pct(st.used, rs.monthlyBudget));
    const rules = [
      'Reward only when seller fault is detected.',
      'Reward is capped at ' + money(rs.maxReward) + ' per ticket.',
      'Monthly limits apply: ' + rs.customerMonthlyCount + ' rewards or ' + money(rs.customerMonthlyCap) + ' per customer, and a ' + money(rs.monthlyBudget) + ' business budget.',
      rs.repeatThreshold + '+ repeat complaints trigger an abuse review.',
      'The customer must confirm the resolution.',
      'Owner approval is mandatory.',
      'A reward can never be issued automatically.',
    ];
    const pending = state.tickets.filter((t) => rewardGate(t).status === 'WAITING FOR OWNER APPROVAL');
    const blocked = state.tickets.filter((t) => rewardGate(t).tone === 'blocked');
    const queue = pending.concat(blocked);
    const queueHtml = queue.length
      ? '<ul class="list-plain">' + queue.map((t) => { const g = rewardGate(t); return '<li class="list-item"><div><strong class="mono">' + esc(t.id) + '</strong> · ' + esc(t.customer) + '<div class="cell-sub">' + esc(g.status) + ' · ' + money(g.amount) + '</div></div><a class="btn btn-secondary btn-sm" href="#/tickets/' + esc(t.id) + '">Open</a></li>'; }).join('') + '</ul>'
      : emptyState('shieldCheck', 'Nothing to review', 'No ticket is waiting on a reward decision right now.');
    const ledgerRows = state.ledger.map((l) => '<tr><td class="mono"><a class="id-link" href="#/tickets/' + esc(l.ticket) + '">' + esc(l.ticket) + '</a></td><td>' + esc(l.customer) + '</td><td>' + money(l.amount) + '</td><td>' + badge(l.status, l.status === 'Issued' ? 'green' : l.status === 'Blocked' ? 'critical' : 'neutral') + '</td><td class="muted nowrap">' + esc(formatDate(l.ts)) + '</td></tr>').join('');
    return '' +
      '<div class="page-head"><div><h1>Rewards</h1><p>Rewards are a controlled goodwill gesture, not an automatic refund. Every reward passes the gate below.</p></div></div>' +
      '<section class="card card-pad" aria-label="Reward workflow"><div class="section-title">Fault Check → Reward Gate</div>' + flowStrip(true) + '</section>' +
      '<section class="mt"><h2 class="section-title">Reward safety rules</h2><ol class="rules-num">' + rules.map((r) => '<li><span>' + esc(r) + '</span></li>').join('') + '</ol></section>' +
      '<section class="grid grid-4 mt" aria-label="Reward statistics">' +
        '<div class="card card-pad"><div class="muted small">Monthly reward budget</div><div class="stat-value">' + money(rs.monthlyBudget) + '</div></div>' +
        '<div class="card card-pad"><div class="muted small">Used</div><div class="stat-value">' + money(st.used) + '</div><div class="progress mt-sm ' + (usedPct > 85 ? 'danger' : usedPct > 65 ? 'warn' : '') + '" role="progressbar" aria-label="Budget used" aria-valuenow="' + usedPct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + usedPct + '%"></span></div></div>' +
        '<div class="card card-pad"><div class="muted small">Remaining</div><div class="stat-value">' + money(remaining) + '</div></div>' +
        '<div class="card card-pad"><div class="row-between"><div><div class="muted small">Rewards issued</div><div class="stat-value">' + st.issued + '</div></div><div><div class="muted small">Blocked</div><div class="stat-value">' + st.blocked + '</div></div></div></div>' +
      '</section>' +
      '<section class="grid grid-main-side mt">' +
        '<div class="card"><div class="card-head"><h2>Reward history</h2></div><div class="table-wrap"><table class="table" style="min-width:520px"><thead><tr><th scope="col">Ticket</th><th scope="col">Customer</th><th scope="col">Amount</th><th scope="col">Outcome</th><th scope="col">Date</th></tr></thead><tbody>' + ledgerRows + '</tbody></table></div></div>' +
        '<div class="card"><div class="card-head"><h2>Needs your decision</h2></div><div class="card-body">' + queueHtml + '</div></div>' +
      '</section>';
  }

  /* ----- AI Rules ----- */
  function ruleCards() {
    if (!state.rules.length) return emptyState('sparkles', 'No rules yet', 'Write your first rule in plain English above.');
    return '<div class="stack-sm">' + state.rules.map((r, i) =>
      '<article class="card rule-card ' + (r.enabled ? '' : 'is-disabled') + '"><span class="rule-num">' + (i + 1) + '</span><div style="flex:1;min-width:0"><p class="rule-text">' + esc(r.text) + '</p><div class="row mt-sm">' + badge(r.enabled ? 'Active' : 'Disabled', r.enabled ? 'green' : 'neutral') + '</div></div>' +
      '<div class="row"><button type="button" class="btn btn-secondary btn-sm" data-action="rule-edit" data-id="' + esc(r.id) + '">' + icon('edit', 14) + 'Edit</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-action="rule-toggle" data-id="' + esc(r.id) + '">' + icon('power', 14) + (r.enabled ? 'Disable' : 'Enable') + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm btn-icon" data-action="rule-delete" data-id="' + esc(r.id) + '" aria-label="Delete rule" data-tip="Delete rule">' + icon('trash', 15) + '</button></div></article>').join('') + '</div>';
  }
  function pageRules() {
    const editing = state.rules.find((r) => r.id === state.ui.editingRule);
    const examples = RULE_EXAMPLES;
    return '' +
      '<div class="page-head"><div><h1>Teach ResolveAI Your Business Rules</h1><p>Write a rule in plain English. Rules are saved in this browser. In this demo they are stored but not yet applied by the simulated engine.</p></div></div>' +
      '<section class="card" aria-labelledby="rule-form-h"><div class="card-head"><h2 id="rule-form-h">' + icon('sparkles', 18) + (editing ? 'Edit rule' : 'New rule') + '</h2></div><div class="card-body">' +
        '<form id="rule-form" class="stack-sm" novalidate><div class="field"><label for="rule-text">Rule</label><textarea class="textarea" id="rule-text" name="text" rows="3" placeholder="Example: If customer mentions ______, then ______.">' + esc(editing ? editing.text : '') + '</textarea><div class="field-error" id="rule-error" role="alert"></div></div>' +
        '<div class="row"><button type="submit" class="btn btn-primary">' + (editing ? 'Update Rule' : 'Save Rule') + '</button>' + (editing ? '<button type="button" class="btn btn-secondary" data-action="rule-cancel">Cancel</button>' : '') + '</div></form>' +
        '<div class="mt"><div class="section-title">Try an example</div><div class="example-list">' + examples.map((e, i) => '<button type="button" class="chip" data-action="rule-example" data-index="' + i + '">' + esc(truncate(e, 62)) + '</button>').join('') + '</div></div>' +
      '</div></section>' +
      '<h2 class="section-title mt">Your rules (' + state.rules.length + ')</h2><div id="rule-list">' + ruleCards() + '</div>';
  }
  const RULE_EXAMPLES = [
    'If the customer mentions hacking or account takeover, mark the ticket as High Priority.',
    'If the customer reports a wrong product, assign it to Returns & Refunds.',
    'If the seller is responsible and the customer confirms resolution, make the ticket eligible for reward review.',
    'If the same customer submits 4 or more similar complaints in a month, flag for abuse review.',
  ];
  const saveRules = () => store.set('resolveai-rules', JSON.stringify(state.rules));

  /* ----- Analytics ----- */
  function pageAnalytics() {
    const total = TOTAL_TICKETS_BASE + state.ui.createdCount;
    const fb = FAULT_BASE; const faultTotal = fb.seller + fb.customer + fb.unclear;
    const st = state.rewardStats;
    const metrics = [
      ['Total tickets', total.toLocaleString('en-IN'), 'Last 30 days', 'ticket', 'blue'],
      ['Resolution rate', '91%', '+2.4 pts vs last month', 'check', 'green'],
      ['Avg resolution time', '4.2 hrs', '-0.6 hrs vs last month', 'clock', 'teal'],
      ['Seller fault rate', pct(fb.seller, faultTotal) + '%', fb.seller + ' tickets', 'alert', 'red'],
      ['Customer fault rate', pct(fb.customer, faultTotal) + '%', fb.customer + ' tickets', 'user', 'blue'],
      ['Reward approval rate', pct(st.issued, st.issued + st.blocked) + '%', st.issued + ' approved, ' + st.blocked + ' blocked', 'gift', 'violet'],
      ['Abuse detection rate', '3.2%', 'Tickets flagged for review', 'shield', 'amber'],
    ].map((m) => '<div class="card kpi"><div class="kpi-top"><span>' + m[0] + '</span><span class="kpi-icon tone-' + m[4] + '">' + icon(m[3], 18) + '</span></div><div class="kpi-value">' + m[1] + '</div><div class="muted small">' + m[2] + '</div></div>').join('');

    const vol = [31, 28, 35, 40, 33, 29, 38, 42, 36, 30, 44, 39, 47, 41];
    const volItems = lastDays(14, false).map((l, i) => ({ label: l, value: vol[i] }));
    const hrs = [5.1, 4.8, 4.6, 4.4, 4.5, 4.1, 3.9];
    const hrItems = lastDays(7, true).map((l, i) => ({ label: l, value: hrs[i] }));
    const rewardValues = [620, 810, 540, 930, Math.max(0, 550 + (st.used - 3450))];
    const rewardItems = ['4 wks ago', '3 wks ago', '2 wks ago', 'Last wk', 'This wk'].map((l, i) => ({ label: l, value: rewardValues[i] }));

    const sP = pct(fb.seller, faultTotal); const cP = pct(fb.customer, faultTotal);
    const donut = 'conic-gradient(var(--c-seller) 0 ' + sP + '%, var(--c-customer) ' + sP + '% ' + (sP + cP) + '%, var(--c-unclear) ' + (sP + cP) + '% 100%)';
    return '' +
      '<div class="page-head"><div><h1>Analytics</h1><p>How your support is performing. Figures are demo data that update with your actions in this session.</p></div></div>' +
      '<section class="grid grid-4" aria-label="Key metrics">' + metrics + '</section>' +
      '<section class="grid grid-2 mt">' +
        '<div class="card"><div class="card-head"><h2>Ticket volume</h2><span class="muted small">Last 14 days</span></div><div class="card-body">' + barChart(volItems, { label: 'Ticket volume over 14 days' }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h2>Average resolution time</h2><span class="muted small">Hours, last 7 days</span></div><div class="card-body">' + lineChart(hrItems, { label: 'Average resolution time', format: (v) => v + 'h' }) + '</div></div>' +
        '<div class="card"><div class="card-head"><h2>Fault distribution</h2></div><div class="card-body"><div class="donut-wrap"><div class="donut" style="background:' + donut + '" role="img" aria-label="Fault distribution: seller ' + sP + '%, customer ' + cP + '%, needs review ' + (100 - sP - cP) + '%"><div class="donut-center"><div><strong>' + faultTotal + '</strong><span class="muted small">analyzed</span></div></div></div>' +
          '<div class="legend"><div class="legend-item"><span class="legend-swatch" style="background:var(--c-seller)"></span>Seller fault · ' + fb.seller + ' (' + sP + '%)</div><div class="legend-item"><span class="legend-swatch" style="background:var(--c-customer)"></span>Customer fault · ' + fb.customer + ' (' + cP + '%)</div><div class="legend-item"><span class="legend-swatch" style="background:var(--c-unclear)"></span>Needs review · ' + fb.unclear + ' (' + (100 - sP - cP) + '%)</div></div></div></div></div>' +
        '<div class="card"><div class="card-head"><h2>Rewards issued</h2><span class="muted small">₹ per week</span></div><div class="card-body">' + barChart(rewardItems, { alt: true, label: 'Rewards issued per week', format: (v) => '₹' + v }) + '</div></div>' +
      '</section>';
  }

  /* ----- Settings ----- */
  function toggleRow(name, checked, label, desc, disabled) {
    return '<label class="switch-row"><span class="switch-text"><strong>' + esc(label) + '</strong><small>' + esc(desc) + '</small></span><span class="switch"><input type="checkbox" name="' + name + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + ' /><span class="switch-ui"></span></span></label>';
  }
  function pageSettings() {
    const s = state.settings;
    const card = (title, iconName, section, body) => '<section class="card"><form data-section="' + section + '" novalidate><div class="card-head"><h2>' + icon(iconName, 18) + title + '</h2></div><div class="card-body stack-sm">' + body + '</div><div class="modal-foot" style="border-radius:0 0 12px 12px"><button type="submit" class="btn btn-primary">Save changes</button></div></form></section>';
    return '' +
      '<div class="page-head"><div><h1>Settings</h1><p>Business details, reward limits and AI preferences. Saved in this browser.</p></div></div>' +
      '<div class="grid grid-2">' +
        card('Business profile', 'user', 'business',
          '<div class="form-grid"><div class="field"><label for="b-name">Business name</label><input class="input" id="b-name" name="name" value="' + esc(s.business.name) + '" required /></div>' +
          '<div class="field"><label for="b-email">Support email</label><input class="input" id="b-email" name="email" type="email" value="' + esc(s.business.email) + '" /></div>' +
          '<div class="field"><label for="b-phone">Phone</label><input class="input" id="b-phone" name="phone" value="' + esc(s.business.phone) + '" /></div>' +
          '<div class="field"><label for="b-tz">Time zone</label><select class="select" id="b-tz" name="timezone">' + ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'].map((z) => '<option' + (z === s.business.timezone ? ' selected' : '') + '>' + z + '</option>').join('') + '</select></div></div>') +
        card('Reward settings', 'gift', 'reward',
          '<div class="form-grid"><div class="field"><label for="r-max">Maximum reward per ticket (₹)</label><input class="input" id="r-max" name="maxReward" type="number" min="1" step="1" value="' + s.reward.maxReward + '" /></div>' +
          '<div class="field"><label for="r-budget">Monthly reward budget (₹)</label><input class="input" id="r-budget" name="monthlyBudget" type="number" min="1" step="1" value="' + s.reward.monthlyBudget + '" /></div>' +
          '<div class="field"><label for="r-repeat">Repeat complaint threshold</label><input class="input" id="r-repeat" name="repeatThreshold" type="number" min="1" step="1" value="' + s.reward.repeatThreshold + '" /></div>' +
          '<div class="field"><label for="r-cap">Per-customer monthly cap (₹)</label><input class="input" id="r-cap" name="customerMonthlyCap" type="number" min="1" step="1" value="' + s.reward.customerMonthlyCap + '" /></div>' +
          '<div class="field"><label for="r-count">Per-customer rewards per month</label><input class="input" id="r-count" name="customerMonthlyCount" type="number" min="1" step="1" value="' + s.reward.customerMonthlyCount + '" /></div></div>' +
          toggleRow('ownerApproval', true, 'Owner approval required', 'Always on. Rewards can never be released without your approval.', true)) +
        card('AI settings', 'bot', 'ai',
          toggleRow('autoAnalyze', s.ai.autoAnalyze, 'Auto-analyze new tickets', 'Run the simulated analysis as soon as a ticket is created.') +
          toggleRow('suggestReplies', s.ai.suggestReplies, 'Suggest reply drafts', 'Show AI reply drafts on analyzed tickets.') +
          '<div class="field"><label for="ai-review">Flag for human review below this confidence</label><select class="select" id="ai-review" name="reviewBelow">' + [60, 70, 80, 90].map((n) => '<option value="' + n + '"' + (n === Number(s.ai.reviewBelow) ? ' selected' : '') + '>' + n + '%</option>').join('') + '</select></div>' +
          '<p class="muted small">Demo build: the AI engine is simulated and runs entirely in your browser.</p>') +
        card('Language preferences', 'languages', 'language',
          '<div class="field"><label for="l-default">Default reply language</label><select class="select" id="l-default" name="defaultReply">' + Object.keys(LANGS).map((k) => '<option value="' + k + '"' + (k === s.language.defaultReply ? ' selected' : '') + '>' + LANGS[k] + '</option>').join('') + '</select><span class="field-hint">Tanglish and Tamil tickets still default to a matching reply.</span></div>' +
          toggleRow('detectTanglish', s.language.detectTanglish, 'Detect Tanglish automatically', 'Label new tickets written in romanised Tamil.')) +
        card('Notification settings', 'mail', 'notifications',
          toggleRow('email', s.notifications.email, 'Email notifications', 'Daily summary and assignment alerts.') +
          toggleRow('reward', s.notifications.reward, 'Reward approval alerts', 'Tell me when a reward is waiting for my decision.') +
          toggleRow('highPriority', s.notifications.highPriority, 'High priority alerts', 'Alert me when a Critical or High ticket arrives.')) +
        '<section class="card"><div class="card-head"><h2>' + icon('users', 18) + 'Teams</h2></div><div class="card-body stack-sm"><ul class="list-plain">' + TEAMS.map((tm) => '<li class="list-item"><div><strong>' + esc(tm.name) + '</strong><div class="cell-sub">Lead: ' + esc(tm.lead) + '</div></div><span class="badge badge-neutral">' + tm.members + ' members</span></li>').join('') + '</ul><a class="btn btn-secondary" href="#/teams">View team workload</a></div></section>' +
      '</div>' +
      '<section class="card mt"><div class="card-head"><h2>Demo data</h2></div><div class="card-body row-between"><p class="muted">Tickets and rewards live in memory and reset when you reload. Settings, rules and theme are kept.</p><button type="button" class="btn btn-secondary" data-action="reset-demo">Reset demo data</button></div></section>';
  }

  function saveSettings(form) {
    const section = form.dataset.section; const fd = new FormData(form); const s = state.settings;
    const num = (k) => Number(fd.get(k));
    if (section === 'business') {
      const name = String(fd.get('name') || '').trim();
      if (!name) { toast('Business name is required.', 'error'); return; }
      s.business = { name: name, email: String(fd.get('email') || '').trim(), phone: String(fd.get('phone') || '').trim(), timezone: String(fd.get('timezone')) };
    } else if (section === 'reward') {
      const vals = { maxReward: num('maxReward'), monthlyBudget: num('monthlyBudget'), repeatThreshold: num('repeatThreshold'), customerMonthlyCap: num('customerMonthlyCap'), customerMonthlyCount: num('customerMonthlyCount') };
      if (Object.keys(vals).some((k) => !Number.isFinite(vals[k]) || vals[k] < 1 || Math.floor(vals[k]) !== vals[k])) { toast('Enter whole numbers of 1 or more for every reward setting.', 'error'); return; }
      if (vals.maxReward > vals.monthlyBudget) { toast('Maximum reward cannot be larger than the monthly budget.', 'error'); return; }
      s.reward = Object.assign({}, s.reward, vals, { ownerApproval: true });
    } else if (section === 'ai') {
      s.ai = { autoAnalyze: fd.has('autoAnalyze'), suggestReplies: fd.has('suggestReplies'), reviewBelow: num('reviewBelow') };
    } else if (section === 'language') {
      s.language = { defaultReply: String(fd.get('defaultReply')), detectTanglish: fd.has('detectTanglish') };
    } else if (section === 'notifications') {
      s.notifications = { email: fd.has('email'), reward: fd.has('reward'), highPriority: fd.has('highPriority') };
    }
    store.set('resolveai-settings', JSON.stringify(s));
    toast('Settings saved.');
  }

  function notFound(title, text, href, label) {
    return '<div class="card">' + emptyState('search', title, text, '<a class="btn btn-primary" href="' + href + '">' + esc(label) + '</a>') + '</div>';
  }

  /* ---------------------------------------------------------
     10. Modals: new ticket & reward review
     --------------------------------------------------------- */
  function openNewTicket() {
    showModal(
      modalHead('New ticket', 'Simulate a customer submitting a support request.') +
      '<form id="ticket-form" novalidate><div class="modal-body stack-sm">' +
        '<div class="form-grid"><div class="field"><label for="nt-name">Customer name</label><input class="input" id="nt-name" name="customer" placeholder="e.g. Kavitha R" autocomplete="off" data-autofocus /><div class="field-error" id="nt-name-error" role="alert"></div></div>' +
        '<div class="field"><label for="nt-order">Order number (optional)</label><input class="input" id="nt-order" name="order" placeholder="e.g. #7850" autocomplete="off" /></div>' +
        '<div class="field full"><label for="nt-lang">Language</label><select class="select" id="nt-lang" name="language"><option value="auto">Auto-detect (simulated)</option><option>English</option><option>Tanglish</option><option>Tamil</option></select></div>' +
        '<div class="field full"><label for="nt-msg">Customer message</label><textarea class="textarea" id="nt-msg" name="message" rows="4" placeholder="Try: Bro product wrong ah vandhurukku. Replace pannunga."></textarea><div class="field-error" id="nt-msg-error" role="alert"></div></div></div>' +
      '</div><div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="modal-close">Cancel</button><button type="submit" class="btn btn-primary">Create ticket</button></div></form>'
    );
  }

  function createTicket(form) {
    const fd = new FormData(form);
    const name = String(fd.get('customer') || '').trim();
    const message = String(fd.get('message') || '').trim();
    let ok = true;
    const setErr = (id, msg, inputName) => {
      const el = $('#' + id, form); if (el) el.textContent = msg;
      const input = form.elements[inputName]; if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    setErr('nt-name-error', name ? '' : 'Please enter the customer name.', 'customer');
    setErr('nt-msg-error', message.length >= 10 ? '' : 'Please enter at least 10 characters.', 'message');
    if (!name || message.length < 10) ok = false;
    if (!ok) return;

    const nums = state.tickets.map((t) => Number(t.id.replace('TKT-', ''))).filter(Number.isFinite);
    const id = 'TKT-' + (Math.max.apply(null, nums) + 1);
    let order = String(fd.get('order') || '').trim();
    if (!order) order = '#' + (7850 + state.ui.createdCount + 1);
    else if (order.charAt(0) !== '#') order = '#' + order;
    let language = String(fd.get('language'));
    if (language === 'auto') language = state.settings.language.detectTanglish ? detectLanguage(message) : (/[\u0B80-\u0BFF]/.test(message) ? 'Tamil' : 'English');
    const previous = state.tickets.filter((t) => t.customer.toLowerCase() === name.toLowerCase()).length;
    const t = {
      id: id, customer: name, order: order, language: language, message: message, status: 'New', analyzed: false,
      priority: null, team: null, fault: 'pending', confidence: 0, analysis: null, replies: null, repeatCount: previous,
      createdAt: Date.now(), updatedAt: Date.now(), reward: { decision: 'pending' }, activity: [], stepsApplied: false,
    };
    log(t, 'Ticket created from customer message');
    state.tickets.unshift(t);
    state.ui.createdCount += 1;
    closeModal();
    toast(id + ' created. ' + (language === 'Tanglish' ? 'Tanglish detected.' : ''));
    location.hash = '#/tickets/' + id;
    if (state.settings.ai.autoAnalyze) setTimeout(() => startAnalysis(id), 60);
  }

  function openRewardReview(t) {
    const g = rewardGate(t); const rs = g.rs;
    const pass = (ok) => (ok ? '<strong class="yes">PASSED</strong>' : '<strong class="no">FAILED</strong>');
    const reasons = [];
    if (g.abuseFlag) reasons.push('This customer has ' + t.repeatCount + ' repeat complaints (limit ' + rs.repeatThreshold + '). An abuse review is required.');
    if (g.overCount) reasons.push('The customer has reached the monthly reward count limit.');
    if (g.overCustomerCap) reasons.push("This reward would exceed the customer's monthly cap.");
    if (g.overBudget) reasons.push('The monthly reward budget is not large enough.');
    if (g.amount <= 0) reasons.push('No reward amount is suggested for this case type.');
    showModal(
      modalHead('Reward Review', t.id + ' · ' + ticketTitle(t)) +
      '<div class="modal-body stack-sm"><div class="dl">' +
        '<div class="dl-row"><span>Customer</span><strong>' + esc(t.customer) + '</strong></div>' +
        '<div class="dl-row"><span>Reason</span><strong>' + esc(t.analysis ? (t.fault === 'seller' ? 'Seller fault: ' + t.analysis.label.toLowerCase() : t.analysis.label) : '—') + '</strong></div>' +
        '<div class="dl-row"><span>Suggested Reward</span><strong>' + money(g.amount) + ' coupon</strong></div>' +
        '<div class="dl-row"><span>Reward limit</span><strong>' + money(rs.maxReward) + ' maximum per ticket</strong></div>' +
        '<div class="dl-row"><span>Monthly usage (this customer)</span><strong>' + money(g.cust.rewardAmount) + ' / ' + money(rs.customerMonthlyCap) + '</strong></div>' +
        '<div class="dl-row"><span>Abuse check</span>' + pass(!g.abuseFlag && g.limitsOk) + '</div>' +
        '<div class="dl-row"><span>Customer confirmation</span>' + pass(g.confirmed) + '</div>' +
        '<div class="dl-row"><span>Owner approval</span><strong class="wait">REQUIRED</strong></div></div>' +
        (reasons.length ? '<div class="notice notice-bad">' + icon('alert', 18) + '<span>' + esc(reasons.join(' ')) + ' Approval is blocked.</span></div>' : '<div class="notice notice-info">' + icon('shieldCheck', 18) + '<span>All safety checks passed. The reward is released only if you approve.</span></div>') +
      '</div><div class="modal-foot"><button type="button" class="btn btn-secondary" data-action="modal-close">Close</button><button type="button" class="btn btn-secondary" data-action="reward-reject" data-id="' + esc(t.id) + '">Reject Reward</button><button type="button" class="btn btn-success" data-action="reward-approve" data-id="' + esc(t.id) + '"' + (g.canApprove ? ' data-autofocus' : ' disabled') + '>Approve Reward</button></div>',
      true
    );
  }

  /* ---------------------------------------------------------
     11. Mock AI analysis flow
     --------------------------------------------------------- */
  function startAnalysis(id) {
    const t = findTicket(id);
    if (!t || t.analyzed || state.ui.analyzing) return;
    state.ui.analyzing = id;
    state.ui.analyzeStep = 0;
    route();
    const total = ANALYSIS_STEPS.length;
    const tick = () => {
      state.ui.analyzeStep += 1;
      if (state.ui.analyzeStep >= total) {
        const a = buildAnalysis(t);
        applyAnalysis(t, a);
        state.metrics.priority[t.priority] += 1;
        state.teamStats[t.team].open += 1;
        t.updatedAt = Date.now();
        log(t, 'AI analysis completed (simulated): ' + t.priority + ' priority, ' + t.team + ', ' + FAULT_LABEL[t.fault].toLowerCase());
        state.ui.analyzing = null;
        route();
        toast('Analysis complete for ' + t.id + '. Demo result, not a real AI.');
      } else {
        route();
        setTimeout(tick, 420);
      }
    };
    setTimeout(tick, 420);
  }

  function advanceTicket(t) {
    const stage = stageOf(t);
    if (stage >= LIFECYCLE.length - 1) return;
    const next = LIFECYCLE[stage + 1];
    if (next === 'In Progress') t.stepsApplied = true;
    const notes = {
      'Assigned': 'Assigned to ' + t.team,
      'In Progress': 'Work started on the ticket',
      'Resolved': 'Marked as resolved',
      'Customer Confirmed': 'Customer confirmed the resolution (simulated)',
      'Closed': 'Ticket closed',
    };
    setStatus(t, next, notes[next]);
    const toasts = { 'Assigned': 'Ticket assigned to ' + t.team + '.', 'In Progress': 'Ticket is now in progress.', 'Resolved': 'Ticket marked as resolved.', 'Customer Confirmed': 'Customer confirmation recorded.', 'Closed': 'Ticket closed.' };
    toast(toasts[next]);
    route();
  }

  /* ---------------------------------------------------------
     12. Router
     --------------------------------------------------------- */
  let lastPath = null;
  function setTitle(t) { document.title = t + ' · ResolveAI'; }

  function route() {
    const raw = (location.hash || '').replace(/^#\/?/, '');
    const bits = raw.split('?');
    const parts = bits[0].split('/').filter(Boolean).map((p) => { try { return decodeURIComponent(p); } catch (e) { return p; } });
    let params = {};
    try { params = Object.fromEntries(new URLSearchParams(bits[1] || '')); } catch (e) { params = {}; }
    document.body.classList.remove('drawer-open');
    if (!modalRoot.firstChild || bits[0] !== lastPath) closeModal();

    if (!isAuthed()) {
      if (parts[0] !== 'login') { location.hash = '#/login'; return; }
      app.innerHTML = pageLogin();
      setTitle('Sign in');
      lastPath = 'login';
      window.scrollTo(0, 0);
      return;
    }
    if (!parts.length || parts[0] === 'login') { location.hash = '#/dashboard'; return; }

    const key = parts[0];
    let html; let title; let active = key;
    switch (key) {
      case 'dashboard': html = pageDashboard(); title = 'Dashboard'; break;
      case 'tickets':
        if (parts[1]) { html = pageTicketDetail(parts[1]); title = parts[1]; }
        else { html = pageTickets(params); title = 'Tickets'; }
        break;
      case 'teams': html = pageTeams(); title = 'Teams'; break;
      case 'rewards': html = pageRewards(); title = 'Rewards'; break;
      case 'rules': html = pageRules(); title = 'AI Rules'; break;
      case 'analytics': html = pageAnalytics(); title = 'Analytics'; break;
      case 'settings': html = pageSettings(); title = 'Settings'; break;
      default: html = notFound('Page not found', 'That page does not exist.', '#/dashboard', 'Go to dashboard'); title = 'Not found'; active = '';
    }
    const same = lastPath === bits[0];
    const y = window.scrollY;
    app.innerHTML = shell(active, html);
    setTitle(title);
    lastPath = bits[0];
    window.scrollTo(0, same ? y : 0);
    if (!same) { const main = $('#main'); if (main) main.focus({ preventScroll: true }); }
  }

  /* ---------------------------------------------------------
     13. Events
     --------------------------------------------------------- */
  function closeProfile() {
    const menu = $('#profile-menu'); const btn = $('[data-action="toggle-profile"]');
    if (menu && !menu.hidden) { menu.hidden = true; if (btn) btn.setAttribute('aria-expanded', 'false'); }
  }
  function openDrawer(open) {
    document.body.classList.toggle('drawer-open', open);
    if (open) { const c = $('#drawer .nav-link'); if (c) c.focus(); }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile')) closeProfile();
    const drawerLink = e.target.closest('.drawer a');
    if (drawerLink) document.body.classList.remove('drawer-open');

    const el = e.target.closest('[data-action]');
    if (!el) {
      const row = e.target.closest('tr[data-href]');
      if (row && !e.target.closest('a, button')) location.hash = row.dataset.href;
      return;
    }
    if (el.tagName === 'SELECT' || el.tagName === 'FORM') return;
    const action = el.dataset.action; const id = el.dataset.id;
    const t = id ? findTicket(id) : null;

    switch (action) {
      case 'toggle-theme': setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); break;
      case 'open-drawer': openDrawer(true); break;
      case 'close-drawer': openDrawer(false); break;
      case 'toggle-profile': {
        const menu = $('#profile-menu');
        if (menu) { menu.hidden = !menu.hidden; el.setAttribute('aria-expanded', String(!menu.hidden)); }
        break;
      }
      case 'logout':
        confirmDialog({ title: 'Sign out?', message: 'You will return to the login screen. Demo data stays in memory until you reload.', confirmLabel: 'Sign out', onConfirm: () => { closeModal(); logout(); } });
        break;
      case 'toggle-password': {
        const input = $('#password');
        if (input) { const show = input.type === 'password'; input.type = show ? 'text' : 'password'; el.innerHTML = icon(show ? 'eyeOff' : 'eye', 16); el.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); }
        break;
      }
      case 'forgot-password': toast('Password reset is not available in this demo.', 'info'); break;
      case 'login-demo': doLogin('owner@kovaikicks.in', $('#login-form [name="remember"]') ? $('#login-form [name="remember"]').checked : false); break;

      case 'filter': state.filters.status = el.dataset.filter; state.filters.page = 1; history.replaceState(null, '', '#/tickets'); refreshTickets(); break;
      case 'page': { const p = Number(el.dataset.page); if (Number.isFinite(p) && p >= 1) { state.filters.page = p; refreshTickets(); } break; }
      case 'clear-filters': state.filters = { status: 'all', search: '', page: 1 }; { const s = $('#ticket-search'); if (s) s.value = ''; } refreshTickets(); break;
      case 'new-ticket': openNewTicket(); break;

      case 'analyze': if (t) startAnalysis(t.id); break;
      case 'advance': if (t) advanceTicket(t); break;
      case 'resume': if (t) { setStatus(t, 'In Progress', 'Customer replied, work resumed'); toast('Ticket is back in progress.'); route(); } break;
      case 'wait-customer': if (t) { setStatus(t, 'Awaiting Customer', 'Waiting for customer reply'); toast('Marked as awaiting customer.', 'info'); route(); } break;
      case 'close':
        if (t) {
          if (!canClose(t)) { toast('Review the reward before closing this ticket.', 'error'); break; }
          confirmDialog({ title: 'Close ' + t.id + '?', message: 'The ticket will be marked as closed. This ends the lifecycle for this complaint.', confirmLabel: 'Close ticket', onConfirm: () => { closeModal(); advanceTicket(t); } });
        }
        break;
      case 'apply-steps':
        if (t && !t.stepsApplied && (t.status === 'New' || t.status === 'Assigned')) {
          if (t.status === 'New') setStatus(t, 'Assigned', 'Assigned to ' + t.team);
          t.stepsApplied = true;
          setStatus(t, 'In Progress', 'Resolution steps applied');
          toast('Resolution steps applied. Ticket is now in progress.');
          route();
        }
        break;
      case 'copy-reply':
        if (t && t.replies) {
          const lang = state.ui.replyLang[t.id] || (t.language === 'Tamil' ? 'ta' : t.language === 'Tanglish' ? 'tg' : state.settings.language.defaultReply);
          const ta = $('#reply-text');
          copyText(ta ? ta.value : t.replies[lang]).then((ok) => toast(ok ? 'Reply copied to clipboard.' : 'Could not copy. Select the text and copy manually.', ok ? 'success' : 'error'));
        }
        break;
      case 'edit-reply':
        if (t) { state.ui.editingReply = state.ui.editingReply === t.id ? null : t.id; route(); const ta = $('#reply-text'); if (ta) ta.focus(); }
        break;
      case 'send-reply':
        if (t && t.replies) {
          const lang = state.ui.replyLang[t.id] || (t.language === 'Tamil' ? 'ta' : t.language === 'Tanglish' ? 'tg' : state.settings.language.defaultReply);
          if (!String(t.replies[lang]).trim()) { toast('The reply is empty.', 'error'); break; }
          state.ui.editingReply = null;
          t.updatedAt = Date.now();
          log(t, 'Reply sent to customer in ' + LANGS[lang] + ' (simulated)');
          toast('Reply sent to ' + t.customer + ' (simulated).');
          route();
        }
        break;
      case 'review-reward': if (t) openRewardReview(t); break;
      case 'reward-approve': if (t) approveReward(t); break;
      case 'reward-reject': if (t) rejectReward(t); break;

      case 'rule-example': { const ta = $('#rule-text'); const txt = RULE_EXAMPLES[Number(el.dataset.index)]; if (ta && txt) { ta.value = txt; ta.focus(); } break; }
      case 'rule-edit': state.ui.editingRule = id; route(); { const ta = $('#rule-text'); if (ta) { ta.focus(); ta.scrollIntoView({ block: 'center' }); } } break;
      case 'rule-cancel': state.ui.editingRule = null; route(); break;
      case 'rule-toggle': {
        const r = state.rules.find((x) => x.id === id);
        if (!r) break;
        const apply = () => { r.enabled = !r.enabled; saveRules(); closeModal(); toast('Rule ' + (r.enabled ? 'enabled' : 'disabled') + '.'); route(); };
        if (r.enabled) confirmDialog({ title: 'Disable this rule?', message: 'ResolveAI will stop using "' + truncate(r.text, 80) + '" until you enable it again.', confirmLabel: 'Disable rule', onConfirm: apply });
        else apply();
        break;
      }
      case 'rule-delete': {
        const r = state.rules.find((x) => x.id === id);
        if (!r) break;
        confirmDialog({ title: 'Delete this rule?', message: 'This permanently removes the rule from this browser.', confirmLabel: 'Delete rule', danger: true, onConfirm: () => { state.rules = state.rules.filter((x) => x.id !== id); if (state.ui.editingRule === id) state.ui.editingRule = null; saveRules(); closeModal(); toast('Rule deleted.', 'info'); route(); } });
        break;
      }
      case 'reset-demo': confirmDialog({ title: 'Reset demo data?', message: 'Tickets, rewards and counters go back to their starting values. Your settings and rules are kept.', confirmLabel: 'Reset', onConfirm: () => { location.reload(); } }); break;

      case 'modal-close': closeModal(); break;
      case 'modal-backdrop': if (e.target === el) closeModal(); break;
      case 'modal-confirm': { const fn = state.ui.confirm; if (fn) fn(); break; }
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target.closest('select[data-action]');
    if (!el) return;
    const t = findTicket(el.dataset.id);
    if (el.dataset.action === 'reply-lang' && t) {
      state.ui.replyLang[t.id] = el.value;
      state.ui.editingReply = null;
      route();
    } else if (el.dataset.action === 'detail-team' && t) {
      assignTeam(t, el.value);
      route();
    }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'ticket-search') {
      state.filters.search = el.value; state.filters.page = 1;
      const r = $('#tickets-results'); if (r) r.innerHTML = resultsHtml();
    } else if (el.id === 'reply-text') {
      const t = findTicket(el.dataset.id);
      if (t && t.replies) t.replies[el.dataset.lang] = el.value;
    } else if (el.id === 'rule-text') {
      const err = $('#rule-error'); if (err) err.textContent = '';
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    e.preventDefault();
    if (form.id === 'login-form') {
      const email = form.elements.email.value.trim(); const pw = form.elements.password.value;
      const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      $('#email-error').textContent = okEmail ? '' : 'Enter a valid email address.';
      $('#password-error').textContent = pw ? '' : 'Enter your password.';
      form.elements.email.setAttribute('aria-invalid', String(!okEmail));
      form.elements.password.setAttribute('aria-invalid', String(!pw));
      if (!okEmail || !pw) return;
      const btn = $('#login-btn'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Signing in...';
      const remember = form.elements.remember.checked;
      setTimeout(() => doLogin(email, remember), 650);
    } else if (form.id === 'ticket-form') {
      createTicket(form);
    } else if (form.id === 'assign-form') {
      const t = findTicket(form.elements.ticket.value);
      if (!t || !t.analyzed) { toast('Choose an analyzed ticket first.', 'error'); return; }
      if (t.team === form.elements.team.value) { toast(t.id + ' is already with ' + t.team + '.', 'info'); return; }
      assignTeam(t, form.elements.team.value);
      route();
    } else if (form.id === 'rule-form') {
      const text = form.elements.text.value.trim();
      const err = $('#rule-error');
      if (text.length < 15) { err.textContent = 'Describe the rule in at least 15 characters, e.g. "If customer mentions ___, then ___".'; form.elements.text.setAttribute('aria-invalid', 'true'); return; }
      const dup = state.rules.some((r) => r.text.toLowerCase() === text.toLowerCase() && r.id !== state.ui.editingRule);
      if (dup) { err.textContent = 'This rule already exists.'; return; }
      if (state.ui.editingRule) {
        const r = state.rules.find((x) => x.id === state.ui.editingRule);
        if (r) r.text = text;
        state.ui.editingRule = null;
        toast('Rule updated.');
      } else {
        state.rules.push({ id: 'r' + Date.now(), text: text, enabled: true });
        toast('Rule saved.');
      }
      saveRules();
      route();
    } else if (form.dataset.section) {
      saveSettings(form);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalRoot.firstChild) { closeModal(); return; }
      if (document.body.classList.contains('drawer-open')) { openDrawer(false); return; }
      const menu = $('#profile-menu');
      if (menu && !menu.hidden) { closeProfile(); const b = $('[data-action="toggle-profile"]'); if (b) b.focus(); }
      return;
    }
    if (e.key === 'Tab' && modalRoot.firstChild) {
      const focusable = $$('.modal button:not([disabled]), .modal input:not([disabled]), .modal select:not([disabled]), .modal textarea:not([disabled]), .modal a[href]', modalRoot);
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', route);
  window.addEventListener('resize', () => { if (window.innerWidth > 1100) document.body.classList.remove('drawer-open'); });

  /* ---------------------------------------------------------
     14. Boot
     --------------------------------------------------------- */
  setTheme(currentTheme());
  route();
})();
