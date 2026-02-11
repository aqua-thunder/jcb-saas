const mongoose = require('mongoose')
const URI = process.env.MONGO_URI;

const connectDb = async () => {
    try {
        await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4, // Force IPv4 to avoid IPv6 DNS issues
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        if (error.code === 'ETIMEOUT') {
            console.error("Tip: This is often a DNS issue. Try switching your DNS to 8.8.8.8 or check if your IP is whitelisted in MongoDB Atlas.");
        }
        process.exit(1);
    }
}

module.exports = connectDb
