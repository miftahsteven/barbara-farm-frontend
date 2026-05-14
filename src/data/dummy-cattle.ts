export interface Cattle {
  id: string;
  qrCode: string;
  name: string;
  breed: string;
  gender: string;
  status: string;
  barn: string;
  initialWeight: number;
  latestWeight: number;
  adg: number;
  bodyConditionScore: number;
  lastWeighingDate: string;
  healthBadge: string;
  image: string;
  purchasePrice?: number;
  sellingPrice?: number;
  feedCost?: number;
  medicalCost?: number;
  roi?: number;
  medicalNotes?: string;
}

const breeds = ["Limousin", "Simental", "Bali", "Angus", "Brahman", "PO"];
const barns = ["Kandang A1", "Kandang A2", "Kandang B1", "Kandang B2", "Kandang C1"];
const statuses = ["Sehat", "Perlu Monitoring", "Dalam Perawatan", "Siap Jual"];
const healthBadges = ["Normal", "ADG Rendah", "Masa Henti Obat", "Pemulihan"];

const generateDummyCattle = (count: number): Cattle[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `BF-2026-${(i + 1).toString().padStart(4, '0')}`;
    const initialWeight = 200 + Math.floor(Math.random() * 150);
    const latestWeight = initialWeight + Math.floor(Math.random() * 200);
    const adg = parseFloat((Math.random() * 1.5).toFixed(2));
    const breed = breeds[Math.floor(Math.random() * breeds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const healthBadge = status === "Sehat" ? "Normal" : healthBadges[Math.floor(Math.random() * healthBadges.length)];
    
    return {
      id,
      qrCode: `SMARTFARM:CATTLE:${id}`,
      name: `Sapi ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
      breed,
      gender: i % 5 === 0 ? "Betina" : "Jantan",
      status,
      barn: barns[Math.floor(Math.random() * barns.length)],
      initialWeight,
      latestWeight,
      adg,
      bodyConditionScore: 2 + Math.floor(Math.random() * 3),
      lastWeighingDate: `2026-05-${(1 + (i % 5)).toString().padStart(2, '0')}`,
      healthBadge,
      image: `https://images.unsplash.com/photo-${[
        "1546445317-29f4545e9d53",
        "1527153369174-43d75a6f9321",
        "1596733430284-f7437764b1a9",
        "1500595046743-cd271d694d30",
        "1570042225831-d98fa7577f1e"
      ][i % 5]}?q=80&w=800&auto=format&fit=crop`,
      purchasePrice: 10000000 + Math.floor(Math.random() * 10000000),
      sellingPrice: 0,
      feedCost: 1000000 + Math.floor(Math.random() * 3000000),
      medicalCost: Math.floor(Math.random() * 1000000),
      roi: 0,
      medicalNotes: status === "Sehat" ? "Kondisi sangat baik." : "Butuh perhatian ekstra pada pakan."
    };
  });
};

export const dummyCattle: Cattle[] = generateDummyCattle(20);
