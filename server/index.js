const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// --- MIDDLEWARE ---
// UPDATE: Added Vercel URL to CORS to allow live communication
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// --- ROOT ROUTE (Fixes Render "Cannot GET /" error) ---
app.get('/', (req, res) => {
    res.send('⛳ Fairway Fund API is Live and Operational.');
});

// --- GOLF SCORE ROUTES (Rolling 5 Logic - PRD Section 05) ---
app.get('/api/scores/:userId', async (req, res) => {
    const { data, error } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', req.params.userId)
        .order('date_played', { ascending: false }); // Latest first [cite: 50]
    
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.post('/api/scores/add', async (req, res) => {
    const { userId, scoreValue, datePlayed } = req.body;

    // PRD Compliance: Validate Stableford range 1-45 [cite: 45]
    if (scoreValue < 1 || scoreValue > 45) {
        return res.status(400).json({ error: "Score must be between 1 and 45" });
    }

    const { data: existingScores, error: fetchError } = await supabase
        .from('golf_scores')
        .select('id')
        .eq('user_id', userId)
        .order('date_played', { ascending: true });

    if (fetchError) return res.status(500).json(fetchError);

    // PRD Compliance: Rolling 5 logic (replace oldest) [cite: 48, 49]
    if (existingScores.length >= 5) {
        await supabase
            .from('golf_scores')
            .delete()
            .eq('id', existingScores[0].id);
    }

    const { data, error: insertError } = await supabase
        .from('golf_scores')
        .insert([{ user_id: userId, score_value: scoreValue, date_played: datePlayed }])
        .select();

    if (insertError) return res.status(500).json(insertError);
    res.json({ message: "Score rolled successfully!", data });
});

// --- STRIPE & SUBSCRIPTION ROUTES (PRD Section 04) ---
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { userId, email, planType } = req.body; 

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Fairway Fund ${planType === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`, // Real-world branding
                    },
                    unit_amount: planType === 'yearly' ? 9000 : 1000, // PRD discounted yearly rate [cite: 41]
                    recurring: {
                        interval: planType === 'yearly' ? 'year' : 'month',
                    },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            // Update these in Render env variables for production
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment=success`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`,
            customer_email: email,
            metadata: { userId },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Error:", err.message);
        res.status(500).json({ error: "Checkout failed" });
    }
});

// --- ADMIN & DRAW ENGINE ROUTES (PRD Section 06/11) ---
app.post('/api/admin/run-draw', async (req, res) => {
    // PRD Compliance: Random generation mode [cite: 57, 58]
    const winningNumbers = Array.from({length: 5}, () => Math.floor(Math.random() * 45) + 1);
    
    const { data, error } = await supabase
        .from('draw_results')
        .insert([{ 
            winning_numbers: winningNumbers, 
            status: 'published' // Admin controls publishing [cite: 62]
        }]);

    if (error) return res.status(500).json(error);
    res.json({ message: "Draw executed and published!", winningNumbers });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));