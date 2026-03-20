const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
// IMPORTANT: Stripe webhooks need the raw body, all other routes use JSON
app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// --- GOLF SCORE ROUTES (Rolling 5 Logic) ---

app.get('/api/scores/:userId', async (req, res) => {
    const { data, error } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', req.params.userId)
        .order('date_played', { ascending: false });
    
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.post('/api/scores/add', async (req, res) => {
    const { userId, scoreValue, datePlayed } = req.body;

    const { data: existingScores, error: fetchError } = await supabase
        .from('golf_scores')
        .select('id')
        .eq('user_id', userId)
        .order('date_played', { ascending: true });

    if (fetchError) return res.status(500).json(fetchError);

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

// --- STRIPE & SUBSCRIPTION ROUTES ---

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { userId, email, planType } = req.body; 

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Golf Charity ${planType === 'yearly' ? 'Yearly' : 'Monthly'} Pro`,
                    },
                    unit_amount: planType === 'yearly' ? 9000 : 1000,
                    // FIX: Added recurring property to resolve Stripe Error
                    recurring: {
                        interval: planType === 'yearly' ? 'year' : 'month',
                    },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:5173/dashboard?payment=success',
            cancel_url: 'http://localhost:5173/dashboard',
            customer_email: email,
            metadata: { userId },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Error:", err.message);
        res.status(500).json({ error: "Checkout failed" });
    }
});

// --- ADMIN & DRAW ENGINE ROUTES ---

app.post('/api/admin/run-draw', async (req, res) => {
    const winningNumbers = Array.from({length: 5}, () => Math.floor(Math.random() * 45) + 1);
    
    const { data, error } = await supabase
        .from('draw_results')
        .insert([{ 
            winning_numbers: winningNumbers, 
            status: 'published'
        }]);

    if (error) return res.status(500).json(error);
    res.json({ message: "Draw executed and published!", winningNumbers });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));