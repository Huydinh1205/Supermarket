const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth"); // Make sure this exists

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
