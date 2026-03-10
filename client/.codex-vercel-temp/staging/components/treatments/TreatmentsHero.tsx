const TreatmentsHero = () => {
    return (
        <div className="flex flex-col gap-6 mb-16 bg-background-light">
            <div className="max-w-3xl">
                <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
                    Advanced Dental{" "}
                    <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-8">
                        Care
                    </span>
                </h1>
                <p className="text-slate-600 text-lg font-normal leading-relaxed">
                    Experience the future of oral health with our premium restorative and cosmetic procedures. Using state-of-the-art diagnostic technology and a patient-first approach, we craft smiles that last a lifetime.
                </p>
            </div>
        </div>
    );
};

export default TreatmentsHero;
