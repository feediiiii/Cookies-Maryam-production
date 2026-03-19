import { db } from "./config";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  onSnapshot 
} from "firebase/firestore";
import type { CookieType, Flavor, OrderStatus } from "../data/cookies";

// Collections
const COOKIES_COLLECTION = "cookies";
const ORDERS_COLLECTION = "orders";

// ============ COOKIES ============

export interface CookieDocument extends Omit<CookieType, "flavors"> {
  flavors: Flavor[];
}

export async function getAllCookies(): Promise<CookieDocument[]> {
  const q = query(collection(db, COOKIES_COLLECTION), orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CookieDocument));
}

export async function getCookieById(id: string): Promise<CookieDocument | null> {
  const docRef = doc(db, COOKIES_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as CookieDocument;
}

export async function createCookie(cookie: Omit<CookieDocument, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COOKIES_COLLECTION), cookie);
  return docRef.id;
}

export async function updateCookie(id: string, cookie: Partial<CookieDocument>): Promise<void> {
  const docRef = doc(db, COOKIES_COLLECTION, id);
  await updateDoc(docRef, cookie);
}

export async function deleteCookie(id: string): Promise<void> {
  const docRef = doc(db, COOKIES_COLLECTION, id);
  await deleteDoc(docRef);
}

// ============ ORDERS ============

export interface OrderDocument {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deliveryType: "delivery" | "pickup";
  notes: string;
  items: Array<{
    cookieId: string;
    cookieName: string;
    flavorId: string;
    flavorName: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export async function getAllOrders(): Promise<OrderDocument[]> {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date()
    } as OrderDocument;
  });
}

export async function getOrderById(id: string): Promise<OrderDocument | null> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date()
  } as OrderDocument;
}

export async function createOrder(order: Omit<OrderDocument, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    createdAt: Timestamp.fromDate(new Date())
  });
  return docRef.id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(docRef, { status });
}

export async function deleteOrder(id: string): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await deleteDoc(docRef);
}

// Real-time order listener for admin dashboard
export function subscribeToOrders(
  callback: (orders: OrderDocument[]) => void,
  onNewOrder?: (order: OrderDocument) => void
): () => void {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"));
  
  let previousOrderCount = 0;
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date()
      } as OrderDocument;
    });
    
    // Check if there's a new order
    if (onNewOrder && orders.length > previousOrderCount && previousOrderCount > 0) {
      const newOrder = orders[0]; // Most recent order
      onNewOrder(newOrder);
    }
    
    previousOrderCount = orders.length;
    callback(orders);
  });
  
  return unsubscribe;
}

// ============ SEED DATA ============

export async function seedInitialData(): Promise<void> {
  const cookies = await getAllCookies();
  if (cookies.length > 0) return; // Already seeded

  const initialCookies = [
    {
      name: "Makroudh",
      description: "Traditional Tunisian semolina pastry filled with date paste, drizzled with honey — a timeless classic.",
      emoji: "🍯",
      color: "#D4A853",
      gradientFrom: "#D4A853",
      gradientTo: "#8B5E2A",
      flavors: [
        { id: "dates", name: "Date & Honey", available: true, price: 1.5 },
        { id: "almond-dates", name: "Almond & Date Mix", available: true, price: 1.8 },
        { id: "pistachio-honey", name: "Pistachio & Honey", available: true, price: 2.0 },
        { id: "fig-honey", name: "Fig & Honey", available: false, price: 1.7 },
      ],
    },
    {
      name: "Ghraïba",
      description: "Melt-in-your-mouth shortbread cookies made with semolina, butter, and sugar — delicate crispy bites.",
      emoji: "✨",
      color: "#F5CBA7",
      gradientFrom: "#F5CBA7",
      gradientTo: "#E59866",
      flavors: [
        { id: "plain", name: "Classic Plain", available: true, price: 1.2 },
        { id: "almond", name: "Almond", available: true, price: 1.5 },
        { id: "sesame", name: "Sesame", available: true, price: 1.3 },
        { id: "lemon-zest", name: "Lemon Zest", available: true, price: 1.4 },
      ],
    },
    {
      name: "Baklawa Cookies",
      description: "Crispy layered pastry bites packed with nuts and soaked in fragrant rose-water syrup.",
      emoji: "🌹",
      color: "#A8D5A2",
      gradientFrom: "#A8D5A2",
      gradientTo: "#5D8A57",
      flavors: [
        { id: "pistachio-rose", name: "Pistachio & Rose Water", available: true, price: 2.5 },
        { id: "walnut-cinnamon", name: "Walnut & Cinnamon", available: true, price: 2.2 },
        { id: "almond-orange", name: "Almond & Orange Blossom", available: true, price: 2.4 },
        { id: "hazelnut", name: "Hazelnut Crunch", available: false, price: 2.6 },
      ],
    },
    {
      name: "Kaak Warka",
      description: "Ring-shaped cookies infused with anise, sesame, and floral water — crunchy bites of Tunisian heritage.",
      emoji: "💍",
      color: "#B39DDB",
      gradientFrom: "#B39DDB",
      gradientTo: "#7E57C2",
      flavors: [
        { id: "anise-sesame", name: "Anise & Sesame", available: true, price: 1.3 },
        { id: "orange-blossom", name: "Orange Blossom", available: true, price: 1.4 },
        { id: "vanilla", name: "Vanilla Butter", available: true, price: 1.4 },
        { id: "chocolate-dipped", name: "Chocolate Dipped", available: false, price: 1.8 },
      ],
    },
  ] as const;

  for (const cookie of initialCookies) {
    await createCookie(JSON.parse(JSON.stringify(cookie)));
  }
}
