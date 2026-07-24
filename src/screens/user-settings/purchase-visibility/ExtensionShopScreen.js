import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { advertisementService, userService } from '../../../services';
import { getUserAdvertisements } from '../../../services/advertisementService';
import PaymentSheet from '../../../components/PaymentSheet';

// ─── Constants ────────────────────────────────────────────────────────────────
const LOCATION_PRICE = 2.50;
const LOCATION_DURATION = '6 months';
const MAX_LOCATIONS = 5;

const SOCIAL_PRICE_PER_MONTH = 2.00;
const SOCIAL_MAX_MONTHS = 12;

const DISTANCE_OPTIONS = [
  { km: 5, label: '5 km', extraCost: 0 },
  { km: 10, label: '10 km', extraCost: 1 },
  { km: 15, label: '15 km', extraCost: 2 },
];

const SHOWCASE_PLANS = [
  { days: 7, label: '7 days', price: 7 },
  { days: 14, label: '14 days', price: 10 },
  { days: 30, label: '30 days', price: 14 },
];

const RISE_TO_TOP_BASE = 1.00;
const QUICKFIND_BASE = 3.00;

const QF_CATEGORIES = [
  'Clothing & Fashion',
  'Shoes & Accessories',
  'Electronics',
  'Home & Garden',
  'Sports & Leisure',
  'Toys & Games',
  'Books & Media',
  'Vehicles & Parts',
  'Art & Collectibles',
  'Other',
];

const QF_CONDITIONS = [
  { id: 'any', label: 'Any' },
  { id: 'new', label: 'New' },
  { id: 'used_good', label: 'Used - Good' },
  { id: 'used_fair', label: 'Used - Fair' },
];



const MEMBERSHIP_TIERS = [
  { color: '#2E7D32', label: 'Green',  price: '£2.00/mo', perks: 'Basic seller perks & priority support' },
  { color: '#E65100', label: 'Orange', price: '£5.00/mo', perks: 'Enhanced visibility & boost discounts' },
  { color: '#F9A825', label: 'Gold',   price: '£10.00/mo', perks: 'Full access · premium placement · exclusive features' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const Stepper = ({ value, onDecrement, onIncrement, label }) => (
  <View style={styles.stepper}>
    <TouchableOpacity style={styles.stepBtn} onPress={onDecrement} activeOpacity={0.7}>
      <Text style={styles.stepBtnText}>−</Text>
    </TouchableOpacity>
    <Text style={styles.stepValue}>{label || value}</Text>
    <TouchableOpacity style={styles.stepBtn} onPress={onIncrement} activeOpacity={0.7}>
      <Text style={styles.stepBtnText}>+</Text>
    </TouchableOpacity>
  </View>
);

const DistanceSelector = ({ selectedIdx, onChange }) => (
  <View style={styles.distanceRow}>
    <Text style={styles.distanceLabel}>Distance</Text>
    <View style={styles.distanceBtns}>
      {DISTANCE_OPTIONS.map((opt, i) => (
        <TouchableOpacity
          key={opt.km}
          style={[styles.distanceBtn, selectedIdx === i && styles.distanceBtnActive]}
          onPress={() => onChange(i)}
          activeOpacity={0.8}
        >
          <Text style={[styles.distanceBtnText, selectedIdx === i && styles.distanceBtnTextActive]}>
            {opt.label}
          </Text>
          {opt.extraCost > 0 && (
            <Text style={[styles.distanceExtra, selectedIdx === i && styles.distanceExtraActive]}>
              +£{opt.extraCost}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const ExtensionShopScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const isBusiness = user?.user_type === 'business';
  const servicePrice = isBusiness ? 5.00 : 2.00;

  const EXTENSION_ROWS = [
    { key: 'locations',    icon: 'location-outline',  name: 'Display Locations',    price: 'from £2.50' },
    { key: 'social',       icon: 'people-outline',     name: 'Social Clubs & Events', price: '£2.00/mo' },
    { key: 'service_listings', icon: 'construct-outline', name: 'Service Listings',     price: `£${servicePrice.toFixed(2)}` },
    { key: 'rise_to_top',  icon: 'rocket-outline',     name: 'Rise to Top',          price: 'from £1.00', isNew: true },
    { key: 'topspot',      icon: 'trophy-outline',     name: 'TopSpot',              price: 'from £1.75' },
    { key: 'showcasing',   icon: 'images-outline',     name: 'ShowCasing',           price: 'from £7.00' },
    { key: 'garage',       icon: 'home-outline',       name: 'GarageSales',          price: 'from £7.00' },
    { key: 'quickfind',    icon: 'flash-outline',      name: 'QuickFind',            price: '£3.00' },
    { key: 'membership',   icon: 'star-outline',       name: 'Membership',           price: 'Coming Soon', isComingSoon: true },
  ];

  const [loading, setLoading] = useState(true);

  // Display Locations
  const [locationCount, setLocationCount] = useState(0);
  const [locationQty, setLocationQty] = useState(1);

  // Social Clubs & Events
  const [socialMonths, setSocialMonths] = useState(1);
  const [activeExtensions, setActiveExtensions] = useState({});

  // Rise to Top
  const [riseToTopDistIdx, setRiseToTopDistIdx] = useState(0);

  // TopSpot
  const [topSpotPlans, setTopSpotPlans] = useState([]);
  const [topSpotPlanIdx, setTopSpotPlanIdx] = useState(0);
  const [topSpotDistIdx, setTopSpotDistIdx] = useState(0);

  // ShowCasing
  const [showCasingPlanIdx, setShowCasingPlanIdx] = useState(0);
  const [showCasingDistIdx, setShowCasingDistIdx] = useState(0);

  // GarageSales
  const [garagePlanIdx, setGaragePlanIdx] = useState(0);
  const [garageDistIdx, setGarageDistIdx] = useState(0);

  // QuickFind
  const [qfCategory, setQfCategory] = useState('');
  const [qfCondition, setQfCondition] = useState('any');
  const [qfKeywords, setQfKeywords] = useState('');
  const [qfDistIdx, setQfDistIdx] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // User's published listings
  const [userListings, setUserListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [listingPickerOpen, setListingPickerOpen] = useState(false);
  const [listingSearch, setListingSearch] = useState('');

  // Which bottom sheet is open (null = none)
  const [openedExtension, setOpenedExtension] = useState(null);

  const openExtension = (key) => {
    setSelectedListingId(null);
    setListingPickerOpen(false);
    setListingSearch('');
    setCategoryOpen(false);
    setCategorySearch('');
    setOpenedExtension(key);
  };
  const closeExtension = () => {
    setOpenedExtension(null);
    setCategoryOpen(false);
    setCategorySearch('');
    setListingPickerOpen(false);
    setListingSearch('');
  };

  // Payment sheet
  const [sheet, setSheet] = useState({ visible: false, title: '', description: '', amount: 0, payload: null });

  // ── Fetch data on focus ──────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadData();

      const initExt = route?.params?.initialExtension;
      if (initExt) {
        openExtension(initExt);
        navigation.setParams({ initialExtension: undefined });
      }
    }, [route?.params?.initialExtension])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [locsResp, plansResp, extResp, listingsResp] = await Promise.all([
        advertisementService.getUserLocations().catch(() => null),
        advertisementService.getAdvertisementPlans().catch(() => null),
        userService.getSocialClubExtensionStatus?.().catch(() => null),
        getUserAdvertisements({ status: 'published', limit: 50 }).catch(() => null),
      ]);

      if (locsResp?.data?.locations) setLocationCount(locsResp.data.locations.length);

      if (plansResp?.data?.plans) {
        const grouped = {};
        plansResp.data.plans.forEach((p) => {
          const t = p.plan_type || 'other';
          if (!grouped[t]) grouped[t] = [];
          grouped[t].push(p);
        });
        const topSpot = (grouped['top_spot'] || grouped['rise_to_top'] || []).sort((a, b) => a.duration_days - b.duration_days);
        setTopSpotPlans(topSpot);
      }

      if (extResp?.data) setActiveExtensions(extResp.data);

      if (listingsResp?.data?.advertisements) {
        setUserListings(listingsResp.data.advertisements.map(a => ({
          id: a.id,
          title: a.title,
          badges: a.badges || [],
        })));
      }
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  // ── Price helpers ─────────────────────────────────────────────────────────────
  const extraCost = (distIdx) => DISTANCE_OPTIONS[distIdx]?.extraCost || 0;

  const remainingSlots = MAX_LOCATIONS - locationCount;

  const topSpotPlan = topSpotPlans[topSpotPlanIdx];
  const topSpotBase = topSpotPlan ? parseFloat(topSpotPlan.discounted_price || topSpotPlan.price || 0) : null;
  const topSpotTotal = topSpotBase !== null ? topSpotBase + extraCost(topSpotDistIdx) : null;
  const topSpotLabel = topSpotPlan?.duration_label || (topSpotPlan ? `${topSpotPlan.duration_days} days` : '—');

  const riseToTopTotal = RISE_TO_TOP_BASE + extraCost(riseToTopDistIdx);

  const showCasingPlan = SHOWCASE_PLANS[showCasingPlanIdx];
  const showCasingTotal = showCasingPlan.price + extraCost(showCasingDistIdx);

  const garagePlan = SHOWCASE_PLANS[garagePlanIdx];
  const garageTotal = garagePlan.price + extraCost(garageDistIdx);

  const qfTotal = QUICKFIND_BASE + extraCost(qfDistIdx);
  const qfCanSend = qfCategory !== '';

  // ── Sheet helpers ────────────────────────────────────────────────────────────
  const openPaymentSheet = (title, description, amount, payload) => {
    closeExtension();
    setSheet({ visible: true, title, description, amount, payload });
  };

  const closePaymentSheet = () => {
    setSheet((s) => ({ ...s, visible: false }));
    loadData();
  };

  // ── Buy handlers ─────────────────────────────────────────────────────────────
  const handleBuyLocation = () => {
    if (remainingSlots === 0) return;
    const qty = locationQty;
    openPaymentSheet(
      'Display Locations',
      `+${qty} Display Location${qty > 1 ? 's' : ''} — ${LOCATION_DURATION}`,
      qty * LOCATION_PRICE,
      { type: 'display_location', planType: 'display_location', quantity: qty }
    );
  };

  const handleBuySocial = () => {
    openPaymentSheet(
      'Social Clubs & Events',
      `${socialMonths} month${socialMonths > 1 ? 's' : ''} access`,
      socialMonths * SOCIAL_PRICE_PER_MONTH,
      { type: 'social_extension', planType: 'social_clubs_bundle', duration_months: socialMonths, items: ['social_clubs', 'events'] }
    );
  };

  const handleBuyServiceListings = () => {
    openPaymentSheet(
      'Service Listings Extension',
      '6 months unlimited service listings access',
      servicePrice,
      { type: 'social_extension', planType: 'service_listings_bundle', duration_months: 6, items: ['service_listings'] }
    );
  };

  const handleBuyRiseToTop = () => {
    const dist = DISTANCE_OPTIONS[riseToTopDistIdx];
    openPaymentSheet(
      'Rise to Top',
      `Once — ${dist.label} radius`,
      riseToTopTotal,
      { type: 'boost', planType: 'rise_to_top', distance_km: dist.km }
    );
  };

  const handleBuyTopSpot = () => {
    if (!topSpotPlan) return;
    const dist = DISTANCE_OPTIONS[topSpotDistIdx];
    openPaymentSheet(
      'TopSpot',
      `${topSpotLabel} — ${dist.label} radius`,
      topSpotTotal,
      { type: 'boost', planType: 'top_spot', plan_id: topSpotPlan.id, distance_km: dist.km }
    );
  };

  const handleBuyShowCasing = () => {
    const dist = DISTANCE_OPTIONS[showCasingDistIdx];
    openPaymentSheet(
      'ShowCasing',
      `${showCasingPlan.label} — ${dist.label} radius`,
      showCasingTotal,
      { type: 'boost', planType: 'show_casing', duration_days: showCasingPlan.days, distance_km: dist.km }
    );
  };

  const handleBuyGarageSales = () => {
    const dist = DISTANCE_OPTIONS[garageDistIdx];
    openPaymentSheet(
      'GarageSales',
      `${garagePlan.label} — ${dist.label} radius`,
      garageTotal,
      { type: 'boost', planType: 'garage_sales', duration_days: garagePlan.days, distance_km: dist.km }
    );
  };

  const handleSendQuickFind = () => {
    if (!qfCanSend) return;
    const dist = DISTANCE_OPTIONS[qfDistIdx];
    openPaymentSheet(
      'QuickFind',
      `${qfCategory}${qfKeywords ? ` · ${qfKeywords}` : ''} — ${dist.label}`,
      qfTotal,
      {
        type: 'quickfind',
        planType: 'quick_find',
        category: qfCategory,
        condition: qfCondition !== 'any' ? qfCondition : null,
        keywords: qfKeywords || null,
        distance_km: dist.km,
      }
    );
  };

  // ── Status helpers ─────────────────────────────────────────────────────────
  const getActiveBadge = (badgeLevel) => {
    for (const listing of userListings) {
      const badge = listing.badges.find(b => b.level === badgeLevel);
      if (badge) return { listing, badge };
    }
    return null;
  };

  const selectedListing = userListings.find(l => l.id === selectedListingId) || null;

  const StatusLine = ({ badgeLevel, extensionName }) => {
    const active = getActiveBadge(badgeLevel);
    if (!active) return <Text style={styles.statusNone}>No active {extensionName}</Text>;
    return (
      <Text style={styles.statusActive}>
        Active on: {active.listing.title}
        {active.badge.expiry_date
          ? ` · expires ${new Date(active.badge.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
          : ''}
      </Text>
    );
  };

  const ListingPicker = () => (
    <>
      <Text style={styles.fieldLabel}>Apply to listing</Text>
      <TouchableOpacity
        style={[styles.fieldPickerBtn, listingPickerOpen && styles.fieldPickerBtnOpen]}
        onPress={() => { setListingPickerOpen(o => !o); setListingSearch(''); }}
        activeOpacity={0.8}
      >
        <Text style={[styles.fieldPickerText, !selectedListing && styles.fieldPickerPlaceholder]}>
          {selectedListing ? selectedListing.title : 'Select a listing…'}
        </Text>
        <Ionicons name={listingPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
      </TouchableOpacity>
      {listingPickerOpen && (
        <View style={styles.inlineCatBox}>
          <View style={styles.catSearchWrap}>
            <Ionicons name="search" size={15} color="#aaa" style={styles.catSearchIcon} />
            <TextInput
              style={styles.catSearchInput}
              value={listingSearch}
              onChangeText={setListingSearch}
              placeholder="Search your listings…"
              placeholderTextColor="#bbb"
              autoCorrect={false}
              autoFocus
            />
            {listingSearch.length > 0 && (
              <TouchableOpacity onPress={() => setListingSearch('')}>
                <Ionicons name="close-circle" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
          {userListings.length === 0 ? (
            <Text style={styles.catNoResults}>No published listings found</Text>
          ) : (() => {
            const filtered = userListings.filter(l =>
              l.title.toLowerCase().includes(listingSearch.toLowerCase())
            );
            if (filtered.length === 0) return <Text style={styles.catNoResults}>No listings match</Text>;
            return filtered.map(listing => (
              <TouchableOpacity
                key={listing.id}
                style={[styles.inlineCatRow, selectedListingId === listing.id && styles.inlineCatRowActive]}
                onPress={() => { setSelectedListingId(listing.id); setListingPickerOpen(false); setListingSearch(''); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.inlineCatText, selectedListingId === listing.id && styles.inlineCatTextActive]} numberOfLines={1}>
                  {listing.title}
                </Text>
                {selectedListingId === listing.id && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ));
          })()}
        </View>
      )}
    </>
  );

  // ── Bottom sheet content per extension ────────────────────────────────────────
  const renderSheetContent = () => {
    switch (openedExtension) {

      case 'locations':
        return (
          <>
            <Text style={styles.sheetDesc}>Show your listings to buyers in extra areas</Text>
            <Text style={styles.sheetRule}>Max 5 locations · Each shows to a different buyer area · 6 months each</Text>
            <View style={styles.locationDots}>
              {Array.from({ length: MAX_LOCATIONS }).map((_, i) => (
                <Ionicons key={i} name={i < locationCount ? 'location' : 'location-outline'} size={20} color={i < locationCount ? COLORS.primary : '#ccc'} />
              ))}
              <Text style={styles.locationCountText}>{locationCount}/{MAX_LOCATIONS} active</Text>
            </View>
            {remainingSlots > 0 ? (
              <>
                <View style={styles.controlsRow}>
                  <Stepper
                    value={locationQty}
                    label={`${locationQty} location${locationQty > 1 ? 's' : ''}`}
                    onDecrement={() => setLocationQty((v) => Math.max(1, v - 1))}
                    onIncrement={() => setLocationQty((v) => Math.min(remainingSlots, v + 1))}
                  />
                  <Text style={styles.totalPrice}>£{(locationQty * LOCATION_PRICE).toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.buyBtn} onPress={handleBuyLocation} activeOpacity={0.8}>
                  <Text style={styles.buyBtnText}>Buy Now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.maxReached}>
                <Text style={styles.maxReachedText}>Maximum 5 locations reached</Text>
              </View>
            )}
          </>
        );

      case 'social':
        return (
          <>
            <Text style={styles.sheetDesc}>Access both Social Club and Events galleries</Text>
            <Text style={styles.sheetRule}>Community-wide · not distance restricted</Text>
            <View style={styles.controlsRow}>
              <Stepper
                value={socialMonths}
                label={`${socialMonths} month${socialMonths > 1 ? 's' : ''}`}
                onDecrement={() => setSocialMonths((v) => Math.max(1, v - 1))}
                onIncrement={() => setSocialMonths((v) => Math.min(SOCIAL_MAX_MONTHS, v + 1))}
              />
              <Text style={styles.totalPrice}>£{(socialMonths * SOCIAL_PRICE_PER_MONTH).toFixed(2)}</Text>
            </View>
            <Text style={styles.priceNote}>£{SOCIAL_PRICE_PER_MONTH.toFixed(2)} / month</Text>
            <TouchableOpacity style={styles.buyBtn} onPress={handleBuySocial} activeOpacity={0.8}>
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </>
        );

      case 'service_listings':
        return (
          <>
            <Text style={styles.sheetDesc}>Unlock the ability to list your professional skills and services</Text>
            <Text style={styles.sheetRule}>Valid for 6 months · Unlimited service listings during active duration</Text>
            <View style={styles.controlsRow}>
              <Text style={styles.sheetRule}>6 months extension access</Text>
              <Text style={styles.totalPrice}>£{servicePrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.buyBtn} onPress={handleBuyServiceListings} activeOpacity={0.8}>
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </>
        );

      case 'rise_to_top':
        return (
          <>
            <Text style={styles.sheetDesc}>Bumps your listing to the top of local search results once</Text>
            <Text style={styles.sheetRule}>One-time use per listing · can repurchase after 1 day</Text>
            <ListingPicker />
            <DistanceSelector selectedIdx={riseToTopDistIdx} onChange={setRiseToTopDistIdx} />
            <View style={styles.priceSummaryRow}>
              <Text style={styles.priceBreakdown}>
                £{RISE_TO_TOP_BASE.toFixed(2)} base{extraCost(riseToTopDistIdx) > 0 ? ` + £${extraCost(riseToTopDistIdx).toFixed(2)} distance` : ''}
              </Text>
              <Text style={styles.totalPrice}>£{riseToTopTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.buyBtn, !selectedListingId && styles.buyBtnDisabled]}
              onPress={selectedListingId ? handleBuyRiseToTop : undefined}
              disabled={!selectedListingId}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
            <StatusLine badgeLevel="rise_to_top" extensionName="Rise to Top" />
          </>
        );

      case 'topspot':
        return (
          <>
            <Text style={styles.sheetDesc}>Stay at the top of search results for a set duration</Text>
            <Text style={styles.sheetRule}>Sustained visibility over days — not a one-time bump</Text>
            <ListingPicker />
            {topSpotPlans.length > 0 ? (
              <>
                <View style={styles.controlsRow}>
                  <Stepper
                    value={topSpotPlanIdx}
                    label={topSpotLabel}
                    onDecrement={() => setTopSpotPlanIdx((v) => Math.max(0, v - 1))}
                    onIncrement={() => setTopSpotPlanIdx((v) => Math.min(topSpotPlans.length - 1, v + 1))}
                  />
                  <Text style={styles.totalPrice}>
                    {topSpotTotal !== null ? `£${topSpotTotal.toFixed(2)}` : '—'}
                  </Text>
                </View>
                <DistanceSelector selectedIdx={topSpotDistIdx} onChange={setTopSpotDistIdx} />
                {extraCost(topSpotDistIdx) > 0 && (
                  <Text style={styles.priceBreakdown}>
                    £{topSpotBase?.toFixed(2)} + £{extraCost(topSpotDistIdx).toFixed(2)} distance
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.noPlanText}>Plans loading…</Text>
            )}
            <TouchableOpacity
              style={[styles.buyBtn, (!topSpotPlan || !selectedListingId) && styles.buyBtnDisabled]}
              onPress={handleBuyTopSpot}
              disabled={!topSpotPlan || !selectedListingId}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
            <StatusLine badgeLevel="top_spot" extensionName="TopSpot" />
          </>
        );

      case 'showcasing':
        return (
          <>
            <Text style={styles.sheetDesc}>Feature in the curated gallery carousel at the top of the feed</Text>
            <ListingPicker />
            <View style={styles.controlsRow}>
              <Stepper
                value={showCasingPlanIdx}
                label={showCasingPlan.label}
                onDecrement={() => setShowCasingPlanIdx((v) => Math.max(0, v - 1))}
                onIncrement={() => setShowCasingPlanIdx((v) => Math.min(SHOWCASE_PLANS.length - 1, v + 1))}
              />
              <Text style={styles.totalPrice}>£{showCasingTotal.toFixed(2)}</Text>
            </View>
            <DistanceSelector selectedIdx={showCasingDistIdx} onChange={setShowCasingDistIdx} />
            {extraCost(showCasingDistIdx) > 0 && (
              <Text style={styles.priceBreakdown}>
                £{showCasingPlan.price.toFixed(2)} + £{extraCost(showCasingDistIdx).toFixed(2)} distance
              </Text>
            )}
            <TouchableOpacity
              style={[styles.buyBtn, !selectedListingId && styles.buyBtnDisabled]}
              onPress={selectedListingId ? handleBuyShowCasing : undefined}
              disabled={!selectedListingId}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
            <StatusLine badgeLevel="show_casing" extensionName="ShowCasing" />
          </>
        );

      case 'garage':
        return (
          <>
            <Text style={styles.sheetDesc}>Feature in HomeMarket & Garage Sales gallery</Text>
            <ListingPicker />
            <View style={styles.controlsRow}>
              <Stepper
                value={garagePlanIdx}
                label={garagePlan.label}
                onDecrement={() => setGaragePlanIdx((v) => Math.max(0, v - 1))}
                onIncrement={() => setGaragePlanIdx((v) => Math.min(SHOWCASE_PLANS.length - 1, v + 1))}
              />
              <Text style={styles.totalPrice}>£{garageTotal.toFixed(2)}</Text>
            </View>
            <DistanceSelector selectedIdx={garageDistIdx} onChange={setGarageDistIdx} />
            {extraCost(garageDistIdx) > 0 && (
              <Text style={styles.priceBreakdown}>
                £{garagePlan.price.toFixed(2)} + £{extraCost(garageDistIdx).toFixed(2)} distance
              </Text>
            )}
            <TouchableOpacity
              style={[styles.buyBtn, !selectedListingId && styles.buyBtnDisabled]}
              onPress={selectedListingId ? handleBuyGarageSales : undefined}
              disabled={!selectedListingId}
              activeOpacity={0.8}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
            <StatusLine badgeLevel="garage_sales" extensionName="GarageSales" />
          </>
        );

      case 'quickfind':
        return (
          <>
            <Text style={styles.sheetDesc}>Send a search notification to nearby buyers & sellers</Text>
            <Text style={styles.sheetRule}>
              We notify users with matching interests and sellers with matching listings
            </Text>
            <Text style={styles.fieldLabel}>What are you looking for?</Text>
            {/* Inline category selector — avoids stacking Modals on iOS */}
            <TouchableOpacity
              style={[styles.fieldPickerBtn, categoryOpen && styles.fieldPickerBtnOpen]}
              onPress={() => { setCategoryOpen(o => !o); setCategorySearch(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldPickerText, !qfCategory && styles.fieldPickerPlaceholder]}>
                {qfCategory || 'Select a category…'}
              </Text>
              <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
            </TouchableOpacity>
            {categoryOpen && (
              <View style={styles.inlineCatBox}>
                <View style={styles.catSearchWrap}>
                  <Ionicons name="search" size={15} color="#aaa" style={styles.catSearchIcon} />
                  <TextInput
                    style={styles.catSearchInput}
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                    placeholder="Search categories…"
                    placeholderTextColor="#bbb"
                    autoCorrect={false}
                    autoFocus
                  />
                  {categorySearch.length > 0 && (
                    <TouchableOpacity onPress={() => setCategorySearch('')}>
                      <Ionicons name="close-circle" size={16} color="#ccc" />
                    </TouchableOpacity>
                  )}
                </View>
                {QF_CATEGORIES
                  .filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.inlineCatRow, qfCategory === cat && styles.inlineCatRowActive]}
                      onPress={() => { setQfCategory(cat); setCategoryOpen(false); setCategorySearch(''); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.inlineCatText, qfCategory === cat && styles.inlineCatTextActive]}>
                        {cat}
                      </Text>
                      {qfCategory === cat && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                    </TouchableOpacity>
                  ))
                }
                {QF_CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                  <Text style={styles.catNoResults}>No categories found</Text>
                )}
              </View>
            )}
            <Text style={styles.fieldLabel}>
              Keywords <Text style={styles.fieldLabelOptional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={qfKeywords}
              onChangeText={setQfKeywords}
              placeholder="e.g. red, size M, vintage…"
              placeholderTextColor="#bbb"
              maxLength={60}
            />
            <Text style={styles.fieldLabel}>Condition</Text>
            <View style={styles.conditionRow}>
              {QF_CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.conditionBtn, qfCondition === c.id && styles.conditionBtnActive]}
                  onPress={() => setQfCondition(c.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.conditionBtnText, qfCondition === c.id && styles.conditionBtnTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <DistanceSelector selectedIdx={qfDistIdx} onChange={setQfDistIdx} />
            <View style={styles.priceSummaryRow}>
              <Text style={styles.priceBreakdown}>
                £{QUICKFIND_BASE.toFixed(2)} base{extraCost(qfDistIdx) > 0 ? ` + £${extraCost(qfDistIdx).toFixed(2)} distance` : ''}
              </Text>
              <Text style={styles.totalPrice}>£{qfTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.buyBtn, !qfCanSend && styles.buyBtnDisabled]}
              onPress={handleSendQuickFind}
              disabled={!qfCanSend}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.buyBtnText}>Send QuickFind</Text>
            </TouchableOpacity>
            {!qfCanSend && <Text style={styles.qfHint}>Select a category to continue</Text>}
            <StatusLine badgeLevel="quick_find" extensionName="QuickFind" />
          </>
        );

      case 'membership':
        return (
          <>
            <View style={styles.comingSoonBanner}>
              <Ionicons name="time-outline" size={28} color="#888" />
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
              <Text style={styles.comingSoonSub}>
                Memberships are launching in early 2027. Enjoy full access free until then.
              </Text>
            </View>
            <Text style={styles.tierSectionLabel}>Planned tiers</Text>
            {MEMBERSHIP_TIERS.map((tier) => (
              <View key={tier.label} style={styles.tierRow}>
                <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                <View style={styles.tierInfo}>
                  <Text style={styles.tierLabel}>{tier.label}</Text>
                  <Text style={styles.tierPerks}>{tier.perks}</Text>
                </View>
                <Text style={[styles.tierPrice, { color: tier.color }]}>{tier.price}</Text>
              </View>
            ))}
            <Text style={styles.tierNote}>
              Pricing and features may change before launch.
            </Text>
          </>
        );

      default:
        return null;
    }
  };

  const openedRow = EXTENSION_ROWS.find(r => r.key === openedExtension);

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ShopHeader navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ShopHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {EXTENSION_ROWS.map((row) => (
          <TouchableOpacity
            key={row.key}
            style={styles.frame}
            onPress={() => openExtension(row.key)}
            activeOpacity={0.75}
          >
            <View style={styles.frameIconWrap}>
              <Ionicons name={row.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.frameName}>{row.name}</Text>
            {row.isNew && (
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
            )}
            {row.isComingSoon && (
              <View style={styles.soonBadge}><Text style={styles.soonBadgeText}>SOON</Text></View>
            )}
            <View style={styles.frameRight}>
              <Text style={styles.framePrice}>{row.price}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Extension bottom sheet ─────────────────────────────────────────────── */}
      <Modal
        visible={openedExtension !== null}
        transparent
        animationType="slide"
        onRequestClose={closeExtension}
      >
        <View style={styles.sheetContainer}>
          <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={closeExtension} />
          <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            {openedRow && (
              <View style={styles.sheetHeaderLeft}>
                <View style={styles.sheetIconWrap}>
                  <Ionicons name={openedRow.icon} size={22} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>{openedRow.name}</Text>
                  <Text style={styles.sheetPriceHint}>{openedRow.price}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={closeExtension} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderSheetContent()}
          </ScrollView>
        </View>
        </View>
      </Modal>

      {/* ── Payment sheet ──────────────────────────────────────────────────────── */}
      <PaymentSheet
        visible={sheet.visible}
        onClose={closePaymentSheet}
        title={sheet.title}
        description={sheet.description}
        amount={sheet.amount}
        currency="GBP"
        payload={sheet.payload}
        onSuccess={closePaymentSheet}
      />



    </SafeAreaView>
  );
};

// ── Header component ──────────────────────────────────────────────────────────
const ShopHeader = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons name="chevron-back" size={28} color="#000" />
    </TouchableOpacity>
    <View style={styles.headerText}>
      <Text style={styles.headerTitle}>Extensions & Boosts</Text>
      <Text style={styles.headerSub}>Grow your reach and sell faster</Text>
    </View>
    <View style={styles.headerRight} />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  headerText: { flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 1 },
  headerRight: { width: 32 },

  scroll: { padding: 16, paddingBottom: 40, gap: 12 },

  // Extension row
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    gap: 12,
  },
  frameIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  frameRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  framePrice: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // NEW badge
  newBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // SOON badge
  soonBadge: {
    backgroundColor: '#888',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  soonBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // ── Bottom sheet ────────────────────────────────────────────────────────────
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  sheetPriceHint: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: { flexShrink: 1 },
  sheetScrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 0 },

  sheetDesc: { fontSize: 14, color: '#444', marginBottom: 4, lineHeight: 20 },
  sheetRule: { fontSize: 12, color: '#aaa', marginBottom: 14, fontStyle: 'italic' },

  // Controls row (stepper + price)
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 6,
  },
  totalPrice: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  priceNote: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: -8, marginBottom: 12 },

  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  priceBreakdown: { fontSize: 12, color: '#aaa', flex: 1, marginRight: 8 },

  // Location dots
  locationDots: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  locationCountText: { fontSize: 12, color: '#888', marginLeft: 6 },
  maxReached: { alignItems: 'center', paddingVertical: 12 },
  maxReachedText: { fontSize: 13, color: '#aaa' },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, fontWeight: '400', color: '#333', lineHeight: 24 },
  stepValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', minWidth: 80, textAlign: 'center' },

  // Distance selector
  distanceRow: { marginBottom: 14 },
  distanceLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  distanceBtns: { flexDirection: 'row', gap: 8 },
  distanceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  distanceBtnActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF' },
  distanceBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  distanceBtnTextActive: { color: COLORS.primary },
  distanceExtra: { fontSize: 11, color: '#aaa', marginTop: 1 },
  distanceExtraActive: { color: COLORS.primary },

  // Buy button
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 8,
  },
  buyBtnDisabled: { backgroundColor: '#ccc' },
  buyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  noPlanText: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 12 },

  // Field pickers & inputs
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  fieldLabelOptional: { fontWeight: '400', color: '#aaa' },
  fieldPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  fieldPickerText: { fontSize: 14, color: '#1a1a1a', fontWeight: '500', flex: 1, marginRight: 8 },
  fieldPickerPlaceholder: { color: '#bbb', fontWeight: '400' },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  conditionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  conditionBtnActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF' },
  conditionBtnText: { fontSize: 13, fontWeight: '500', color: '#555' },
  conditionBtnTextActive: { color: COLORS.primary },
  qfHint: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 4 },

  // Status lines
  statusActive: { fontSize: 12, color: COLORS.primary, marginTop: 6, textAlign: 'center' },
  statusNone: { fontSize: 12, color: '#bbb', marginTop: 6, textAlign: 'center' },

  // Picker modals (listing + category)
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerRowActive: { backgroundColor: '#F5F7FF' },
  pickerRowText: { fontSize: 15, color: '#333' },
  pickerRowTextActive: { color: COLORS.primary, fontWeight: '600' },

  // Inline category selector
  fieldPickerBtnOpen: {
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  inlineCatBox: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 4,
    maxHeight: 260,
    overflow: 'hidden',
  },
  catSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    margin: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
  },
  catSearchIcon: { marginRight: 6 },
  catSearchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  inlineCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inlineCatRowActive: { backgroundColor: '#F0F4FF' },
  inlineCatText: { fontSize: 14, color: '#333' },
  inlineCatTextActive: { color: COLORS.primary, fontWeight: '600' },
  catNoResults: { fontSize: 13, color: '#bbb', textAlign: 'center', paddingVertical: 16 },

  // Membership coming soon
  comingSoonBanner: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    marginBottom: 20,
    gap: 6,
  },
  comingSoonTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  comingSoonSub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 19 },
  tierSectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  tierDot: { width: 14, height: 14, borderRadius: 7 },
  tierInfo: { flex: 1 },
  tierLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  tierPerks: { fontSize: 12, color: '#888', marginTop: 2 },
  tierPrice: { fontSize: 14, fontWeight: '700' },
  tierNote: { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});

export default ExtensionShopScreen;
