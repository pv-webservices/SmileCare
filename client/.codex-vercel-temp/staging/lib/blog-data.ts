export interface BlogArticle {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    image: string;
    content: string;   // full HTML/markdown-like content
}

export const BLOG_ARTICLES: BlogArticle[] = [
    {
        slug: "future-of-dental-care-digital-dentistry-ai",
        title: "The Future of Dental Care: Digital Dentistry and AI",
        excerpt: "Discover how AI is revolutionizing diagnostic accuracy and treatment planning in modern dental clinics.",
        category: "Technology",
        date: "May 15, 2024",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
        content: `
<p>The dental industry is undergoing a profound transformation driven by artificial intelligence, machine learning, and digital imaging technologies. What once required hours of manual analysis can now be accomplished in seconds with greater accuracy than any human could achieve alone.</p>

<h2>AI-Powered Diagnostics</h2>
<p>Modern AI diagnostic tools can now detect cavities, gum disease, and even early-stage oral cancer from X-rays and intraoral scans with an accuracy rate exceeding 95%. These systems are trained on millions of clinical images, enabling them to spot patterns that even experienced clinicians might miss during a routine examination.</p>
<p>At SmileCare, our AI-assisted diagnostic suite reviews every scan in real time, flagging potential concerns and cross-referencing findings with the latest clinical literature. This means you receive a more thorough assessment in less time — without any additional discomfort.</p>

<h2>3D Treatment Planning</h2>
<p>Gone are the days of relying on 2D X-rays and physical impressions. Cone Beam Computed Tomography (CBCT) combined with AI-driven software creates a precise 3D model of your teeth, jaw, and surrounding structures. This allows our clinicians to simulate the entire treatment journey — from the first consultation to the final restoration — before a single procedure begins.</p>
<p>For implant patients, this means the titanium post can be placed with sub-millimetre precision, dramatically reducing recovery time and improving long-term outcomes. For orthodontic patients, every stage of tooth movement is planned digitally, so you can see your final smile before treatment even starts.</p>

<h2>Digital Impressions & Same-Day Restorations</h2>
<p>Traditional dental moulds were uncomfortable and often inaccurate. Digital intraoral scanners create a detailed 3D map of your mouth in under two minutes, with no unpleasant putty required. These digital impressions are then fed directly into our in-clinic milling machines, which can fabricate a porcelain crown, inlay, or veneer in approximately 90 minutes — meaning you can leave the same appointment with a permanent restoration.</p>

<h2>The Road Ahead</h2>
<p>Researchers are currently developing AI systems capable of predicting dental issues up to five years before they become clinically visible. Combined with personalised genomic data and lifestyle tracking, the dentist of the future will be able to offer truly preventative care — catching problems before they ever develop. At SmileCare, we are committed to staying at the forefront of every breakthrough that benefits our patients.</p>
        `.trim(),
    },
    {
        slug: "5-tips-maintaining-teeth-whitening-results",
        title: "5 Tips for Maintaining Your Teeth Whitening Results",
        excerpt: "Learn the best practices to keep your smile bright and radiant for months after your professional treatment.",
        category: "Tips & Care",
        date: "May 10, 2024",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200",
        content: `
<p>Professional teeth whitening can brighten your smile by several shades in a single appointment. But maintaining those results requires a little discipline and some smart habits. Here are five evidence-backed tips our clinical team recommends to every patient after their whitening treatment.</p>

<h2>1. Follow the White Diet for 48 Hours</h2>
<p>Immediately after whitening, your enamel pores are temporarily more open and susceptible to staining. During this 48-hour window, stick to white or pale-coloured foods and beverages: chicken, rice, pasta, milk, water, and bananas are all safe choices. Avoid coffee, red wine, beetroot, tomato sauce, and dark berries until your enamel has fully re-mineralised.</p>

<h2>2. Use a Whitening Toothpaste (But Sparingly)</h2>
<p>Whitening toothpastes containing mild abrasives or hydrogen peroxide can help remove surface stains before they set. However, using them every day can gradually erode enamel over time. Our recommendation: use a whitening toothpaste two to three times per week and a fluoride-rich, enamel-strengthening paste for your remaining brushing sessions.</p>

<h2>3. Drink Staining Beverages Through a Straw</h2>
<p>Coffee, tea, and cola are some of the biggest culprits for re-staining whitened teeth. If you cannot give them up entirely, drinking through a straw minimises contact between the liquid and your front teeth. It sounds minor, but clinical studies suggest this habit alone can extend whitening results by several weeks.</p>

<h2>4. Schedule Regular Professional Cleanings</h2>
<p>Professional polishing during your regular hygienist appointment removes the layer of plaque and tartar that traps chromogenic molecules against your enamel. Patients who attend six-monthly cleanings consistently maintain their whitening results approximately 40% longer than those who skip appointments. Book your next hygiene visit before you leave the clinic after your whitening treatment.</p>

<h2>5. Consider At-Home Top-Up Trays</h2>
<p>Your SmileCare clinician can provide custom-fitted whitening trays with a low-concentration professional gel for periodic at-home touch-ups. Used for 30 minutes once or twice a month, these trays are far more effective than over-the-counter strips because they cover the entire tooth surface evenly. Ask your clinician about our maintenance kit at your next appointment.</p>

<p>With the right care routine, professional whitening results can last 12 to 18 months or longer. The key is consistency — small daily habits compound into a lasting, confident smile.</p>
        `.trim(),
    },
];
