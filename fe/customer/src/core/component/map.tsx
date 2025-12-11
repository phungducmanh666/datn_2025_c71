"use client";

import { AddressInfo } from "@data/locationData";
import { MapComponentRef } from "@util/datadefindnation";
import { Button, Card, Col, Flex, Row, Spin, Typography } from "antd";
import L from "leaflet";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BiLocationPlus } from "react-icons/bi";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

interface MyAddrProps {}

const HANOI_CENTER: L.LatLngTuple = [21.0285, 105.8542];

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (e: L.LeafletMouseEvent) => any;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapComponent = forwardRef<MapComponentRef, MyAddrProps>(({}, ref) => {
  const mapRef = useRef<L.Map>(null);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [position, setPosition] = useState<L.LatLng>();
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    getPosition: () => (position ? position : null),
    getAddressInfo: () => addressInfo,
    isLoadingAddress: () => loadingAddress,
    getMap: () => mapRef.current,
    locate: handleLocate,
    setView: (lat: number, lng: number, zoom = 13) =>
      mapRef.current?.setView([lat, lng], zoom),
  }));

  const getAddressFromCoords = async (lat: number, lon: number) => {
    setLoadingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.address) {
        const addr = data.address;
        setAddressInfo({
          displayName: data.display_name,
          houseNumber: addr.house_number || "",
          road: addr.road || "",
          suburb: addr.suburb || addr.quarter || addr.neighbourhood || "",
          district: addr.county || addr.district || addr.city_district || "",
          city: addr.city || addr.town || addr.province || "",
          state: addr.state || "",
          country: addr.country || "",
          postcode: addr.postcode || "",
        });

        console.log("📍 Địa chỉ:", data.display_name);
        console.log("🏠 Chi tiết:", addr);
      } else {
        setAddressInfo(null);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const latlng: L.LatLng = e.latlng;
    getAddressFromCoords(latlng.lat, latlng.lng);
    setPosition(latlng);
  };

  const handleLocate = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      return;
    }

    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
    }

    navigator.geolocation.getCurrentPosition((pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const latlng: L.LatLng = new L.LatLng(latitude, longitude);
      setPosition(latlng);
      getAddressFromCoords(latitude, longitude);
      mapRef.current?.setView(latlng, 15);
    });
  };

  const LocationInfoComponent = () => {
    if (!position || loadingAddress)
      return (
        <Card size="small" loading={true}>
          <Typography>Đang lấy thông tin ví trí...</Typography>
        </Card>
      );
    return (
      <Card size="small" title="🌍 Tọa độ">
        <p style={{ margin: 0, fontSize: 13 }}>
          <strong>Vĩ độ:</strong> {position?.lat.toFixed(6)}
          <br />
          <strong>Kinh độ:</strong> {position?.lng.toFixed(6)}
        </p>
      </Card>
    );
  };

  const AddressInfoComponent = () => {
    if (loadingAddress)
      return (
        <Card size="small" loading={true}>
          <p>Đang lấy thông tin địa chỉ...</p>
        </Card>
      );
    if (!addressInfo) {
      return (
        <Card size="small" title="📮 Thông tin địa chỉ">
          <strong>Lỗi: </strong>Địa chỉ không xác định
        </Card>
      );
    }
    return (
      <Card size="small" title="📮 Thông tin địa chỉ">
        <div style={{ fontSize: 13 }}>
          {addressInfo.houseNumber && (
            <p style={{ margin: "4px 0" }}>
              <strong>Số nhà:</strong> {addressInfo.houseNumber}
            </p>
          )}
          {addressInfo.road && (
            <p style={{ margin: "4px 0" }}>
              <strong>Đường:</strong> {addressInfo.road}
            </p>
          )}
          {addressInfo.suburb && (
            <p style={{ margin: "4px 0" }}>
              <strong>Phường/Xã:</strong> {addressInfo.suburb}
            </p>
          )}
          {addressInfo.district && (
            <p style={{ margin: "4px 0" }}>
              <strong>Quận/Huyện:</strong> {addressInfo.district}
            </p>
          )}
          {addressInfo.city && (
            <p style={{ margin: "4px 0" }}>
              <strong>Thành phố:</strong> {addressInfo.city}
            </p>
          )}
          {addressInfo.state && (
            <p style={{ margin: "4px 0" }}>
              <strong>Tỉnh:</strong> {addressInfo.state}
            </p>
          )}
          {addressInfo.country && (
            <p style={{ margin: "4px 0" }}>
              <strong>Quốc gia:</strong> {addressInfo.country}
            </p>
          )}
          {addressInfo.postcode && (
            <p style={{ margin: "4px 0" }}>
              <strong>Mã bưu điện:</strong> {addressInfo.postcode}
            </p>
          )}
          <p
            style={{
              margin: "12px 0 4px 0",
              paddingTop: "8px",
              borderTop: "1px solid #91d5ff",
            }}
          >
            <strong>Địa chỉ đầy đủ:</strong>
            <br />
            {addressInfo.displayName}
          </p>
        </div>
      </Card>
    );
  };

  useEffect(() => {
    handleLocate();
  }, []);

  return (
    <Row style={{ height: "100vh", width: "100%" }} wrap>
      <Col md={{ span: 24 }} xl={{ span: 6 }}>
        <Flex vertical gap={20} style={{ padding: 20 }}>
          <Button
            type="primary"
            onClick={handleLocate}
            icon={<BiLocationPlus />}
          >
            Vị trí của tôi
          </Button>
          <LocationInfoComponent />
          <AddressInfoComponent />
        </Flex>
      </Col>
      <Col md={{ span: 24 }} xl={{ span: 18 }}>
        <MapContainer
          ref={mapRef}
          center={HANOI_CENTER}
          zoom={13}
          style={{ width: "100%", height: "100vh" }}
        >
          <MapClickHandler onMapClick={handleMapClick} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="bản đồ đường phố">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Vệ tinh">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Địa hình">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e: L.DragEndEvent) => {
                  const latlng: L.LatLng = e.target._latlng;
                  getAddressFromCoords(latlng.lat, latlng.lng);
                },
              }}
            >
              <Popup>
                {loadingAddress ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <strong>📍 Vị trí đã chọn</strong>
                    <br />
                    Lat: {position.lat.toFixed(6)}
                    <br />
                    Lon: {position.lng.toFixed(6)}
                    {addressInfo && (
                      <>
                        <br />
                        <br />
                        <strong>Địa chỉ:</strong>
                        <br />
                        <span style={{ fontSize: 12 }}>
                          {addressInfo.displayName}
                        </span>
                      </>
                    )}
                  </>
                )}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </Col>
    </Row>
  );
});

MapComponent.displayName = "MapComponent";
export default MapComponent;
