import { AddressInfo } from "@data/locationData";

export interface MapComponentRef {
  getPosition: () => L.LatLng | null;
  getAddressInfo: () => AddressInfo | null;
  isLoadingAddress: () => boolean;
  getMap: () => L.Map | null;
  locate: () => void;
  setView: (lat: number, lng: number, zoom?: number) => void;
}
