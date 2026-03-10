export interface Treatment {
    id: string;
    slug: string;
    name: string;
    description: string;
    longDescription?: string;
    price: number;
    duration: number; // in minutes
    imageUrl: string;
    category: "General" | "Cosmetic" | "Surgical" | "Orthodontic";
}
