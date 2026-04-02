const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));

// Store user sessions
let users = {};

app.post("/webhook", (req, res) => {
  const msg = (req.body.Body || "").toLowerCase();
  const user = req.body.From;

  if (!users[user]) {
    users[user] = {
      step: "start",
      name: "",
      cart: null,
      qty: 0
    };
  }

  let userData = users[user];
  let reply = "";

  console.log("User:", user, "| Msg:", msg);

  // STEP 1: GREETING
  if (msg === "hi" || msg === "hello") {
    userData.step = "ask_name";
    reply = "👋 Welcome to *Breezy Cafe!* ☕\n\nWhat's your name?";
  }

  // STEP 2: GET NAME
  else if (userData.step === "ask_name") {
    userData.name = msg;
    userData.step = "menu";

    reply = `😊 Nice to meet you *${msg}*!\n\n🍽️ *Menu*\n\n1️⃣ Pizza - ₹200\n2️⃣ Burger - ₹150\n3️⃣ Coke - ₹50\n\n👉 Type number or item name`;
  }

  // STEP 3: MENU SELECTION
  else if (userData.step === "menu") {
    if (msg.includes("1") || msg.includes("pizza")) {
      userData.cart = "Pizza";
      userData.step = "qty";
      reply = "🍕 Pizza selected!\n👉 Enter quantity:";
    }

    else if (msg.includes("2") || msg.includes("burger")) {
      userData.cart = "Burger";
      userData.step = "qty";
      reply = "🍔 Burger selected!\n👉 Enter quantity:";
    }

    else if (msg.includes("3") || msg.includes("coke")) {
      userData.cart = "Coke";
      userData.step = "qty";
      reply = "🥤 Coke selected!\n👉 Enter quantity:";
    }

    else {
      reply = "❌ Invalid choice\n\nPlease select from menu (1,2,3)";
    }
  }

  // STEP 4: QUANTITY
  else if (userData.step === "qty") {
    if (!isNaN(msg)) {
      userData.qty = parseInt(msg);

      let price = 0;
      if (userData.cart === "Pizza") price = 200;
      if (userData.cart === "Burger") price = 150;
      if (userData.cart === "Coke") price = 50;

      const total = price * userData.qty;

      userData.step = "confirm";

      reply = `🧾 *Order Summary*\n\n👤 Name: ${userData.name}\n🍽️ Item: ${userData.cart}\n🔢 Qty: ${userData.qty}\n💰 Total: ₹${total}\n\n✅ Type *confirm* to place order`;
    } else {
      reply = "❌ Please enter valid quantity (number)";
    }
  }

  // STEP 5: CONFIRM ORDER
  else if (userData.step === "confirm" && msg === "confirm") {
    reply = `🎉 *Order Placed Successfully!*\n\nThank you ${userData.name} ❤️\n\n📞 Owner will contact you soon`;

    console.log("🔥 NEW ORDER:", users[user]);

    delete users[user]; // reset
  }

  // DEFAULT
  else {
    reply = "❓ Type *hi* to start ordering";
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${reply}</Message>
    </Response>
  `);
});

// IMPORTANT for deployment or local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});