/**
 * Datamodeller för önskelista-appen
 */

export interface WishItem {
  id: number;
  text: string;
  claimed: boolean;
  claimedBy: string | null;
}

export interface Sublist {
  id: number;
  name: string;
  items: WishItem[];
}

export interface WishList {
  id?: number;
  name: string;
  sublists: Sublist[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO för att skapa en ny önskelista
 */
export interface CreateWishListDTO {
  name: string;
}

/**
 * DTO för att skapa en ny sublista
 */
export interface CreateSublistDTO {
  name: string;
}

/**
 * DTO för att skapa ett nytt önsknings-item
 */
export interface CreateWishItemDTO {
  text: string;
}

/**
 * DTO för att paxa ett item
 */
export interface ClaimWishItemDTO {
  claimedBy: string;
}
