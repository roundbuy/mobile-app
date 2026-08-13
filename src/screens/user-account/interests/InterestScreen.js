import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { advertisementService, userService } from '../../../services';

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const JACKET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const TROUSER_WAISTS = ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44'];
const TROUSER_LENGTHS = ['28', '30', '32', '34', '36'];

const SHOE_SIZES = {
  UK: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
  EU: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
  US: ['4.5', '5.5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
};

const QUALITY_OPTIONS = [
  { id: 'any', label: 'Any' },
  { id: 'high', label: 'High Quality' },
  { id: 'medium', label: 'Medium Quality' },
  { id: 'low', label: 'Low Quality' },
];

const InterestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Filter options from API
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // User preferences
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [shirtSize, setShirtSize] = useState('');
  const [jacketSize, setJacketSize] = useState('');
  const [trouserWaist, setTrouserWaist] = useState('');
  const [trouserLength, setTrouserLength] = useState('');
  const [shoeSizeUK, setShoeSizeUK] = useState('');
  const [sizeSystem, setSizeSystem] = useState('UK');
  const [qualityPreference, setQualityPreference] = useState('any');
  const [brandInput, setBrandInput] = useState('');
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filtersResp, interestsResp] = await Promise.all([
        advertisementService.getFilters(),
        userService.getInterests().catch(() => null),
      ]);

      if (filtersResp?.data) {
        setAvailableCategories(filtersResp.data.categories || []);
        setAvailableColors(filtersResp.data.colors || []);
      }

      if (interestsResp?.data && Object.keys(interestsResp.data).length > 0) {
        const d = interestsResp.data;
        if (d.category_ids) setSelectedCategories(d.category_ids);
        if (d.subcategory_ids) setSelectedSubcategories(d.subcategory_ids);
        if (d.colour_ids) setSelectedColors(d.colour_ids);
        if (d.shirt_size) setShirtSize(d.shirt_size);
        if (d.jacket_size) setJacketSize(d.jacket_size);
        if (d.trouser_waist) setTrouserWaist(d.trouser_waist);
        if (d.trouser_length) setTrouserLength(d.trouser_length);
        if (d.shoe_size_uk) setShoeSizeUK(d.shoe_size_uk);
        if (d.size_system) setSizeSystem(d.size_system);
        if (d.quality_preference) setQualityPreference(d.quality_preference);
        if (d.brand_names) setBrands(d.brand_names);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    const id = cat.id?.toString();
    const isSelected = selectedCategories.includes(id);
    if (isSelected) {
      setSelectedCategories((prev) => prev.filter((c) => c !== id));
      // Remove subcategories that belong to this category
      const subIds = (cat.subcategories || []).map((s) => s.id?.toString());
      setSelectedSubcategories((prev) => prev.filter((s) => !subIds.includes(s)));
    } else {
      setSelectedCategories((prev) => [...prev, id]);
    }
  };

  const toggleSubcategory = (id) => {
    setSelectedSubcategories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleColor = (id) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addBrand = () => {
    const trimmed = brandInput.trim();
    if (!trimmed || brands.includes(trimmed) || brands.length >= 10) return;
    setBrands((prev) => [...prev, trimmed]);
    setBrandInput('');
  };

  const removeBrand = (brand) => {
    setBrands((prev) => prev.filter((b) => b !== brand));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.saveInterests({
        category_ids: selectedCategories,
        subcategory_ids: selectedSubcategories,
        colour_ids: selectedColors,
        shirt_size: shirtSize,
        jacket_size: jacketSize,
        trouser_waist: trouserWaist,
        trouser_length: trouserLength,
        shoe_size_uk: shoeSizeUK,
        size_system: sizeSystem,
        quality_preference: qualityPreference,
        brand_names: brands,
      });
      Alert.alert('Saved', 'Your interests have been updated!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Categories */}
        <SectionHeader title="Favourite Categories" subtitle="Search and select the types of items you're interested in" />
        {availableCategories.length === 0 ? (
          <Text style={styles.emptyHint}>Categories loading…</Text>
        ) : (() => {
          const q = categorySearch.trim().toLowerCase();

          // Build visible list: filter by search, or show all
          const visibleCats = availableCategories.filter(cat => {
            if (!q) return true;
            const catMatch = cat.name.toLowerCase().includes(q);
            const subMatch = (cat.subcategories || []).some(s => s.name.toLowerCase().includes(q));
            return catMatch || subMatch;
          });

          // Group categories into Women, Men, Children, Home, Electronics
          const getGroupedInterests = () => {
            const groups = {
              'Women': [],
              'Men': [],
              'Children': [],
              'Home': [],
              'Electronics': []
            };

            visibleCats.forEach(cat => {
              const catNameLower = (cat.name || '').toLowerCase();
              
              if (catNameLower.includes('children') || catNameLower.includes('babies') || cat.id === 27 || cat.id === 26 || cat.id === 28) {
                groups.Children.push(cat);
              } else if (catNameLower.includes('home') || catNameLower.includes('furniture') || cat.id === 13 || cat.id === 14) {
                groups.Home.push(cat);
              } else if (catNameLower.includes('electronics') || catNameLower.includes('phones') || catNameLower.includes('computers') || catNameLower.includes('cameras') || cat.id === 1 || cat.id === 18 || cat.id === 19 || cat.id === 20 || cat.id === 21 || cat.id === 15) {
                groups.Electronics.push(cat);
              } else if (catNameLower.includes('bags') || catNameLower.includes('beauty') || cat.id === 25 || cat.id === 29) {
                groups.Women.push(cat);
              } else if (cat.id === 16 || catNameLower.includes('clothing') || catNameLower.includes('fashion')) {
                const womenSub = { ...cat, subcategories: [] };
                const menSub = { ...cat, subcategories: [] };

                (cat.subcategories || []).forEach(sub => {
                  const subNameLower = (sub.name || '').toLowerCase();
                  if (subNameLower.includes('women') || subNameLower.includes('girl') || subNameLower.includes('ladies') || subNameLower.includes('dresses')) {
                    womenSub.subcategories.push(sub);
                  } else if (subNameLower.includes('men') || subNameLower.includes('boy') || subNameLower.includes('gent') || subNameLower.includes('suit')) {
                    menSub.subcategories.push(sub);
                  } else {
                    womenSub.subcategories.push(sub);
                  }
                });

                if (womenSub.subcategories.length > 0) groups.Women.push(womenSub);
                if (menSub.subcategories.length > 0) groups.Men.push(menSub);
              } else {
                if (cat.id === 439) {
                  groups.Women.push(cat);
                } else {
                  groups.Home.push(cat);
                }
              }
            });

            return groups;
          };

          const grouped = getGroupedInterests();
          const totalSelected = selectedCategories.length + selectedSubcategories.length;

          return (
            <>
              {/* Search bar */}
              <View style={styles.catSearchBar}>
                <Ionicons name="search" size={16} color="#aaa" />
                <TextInput
                  style={styles.catSearchInput}
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                  placeholder="Search categories & subcategories…"
                  placeholderTextColor="#bbb"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {categorySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCategorySearch('')}>
                    <Ionicons name="close-circle" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Selection summary */}
              {totalSelected > 0 && (
                <View style={styles.catSummaryRow}>
                  <Text style={styles.catSummaryText}>
                    {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'}
                    {selectedSubcategories.length > 0 ? ` · ${selectedSubcategories.length} subcategor${selectedSubcategories.length !== 1 ? 'ies' : 'y'}` : ''} selected
                  </Text>
                  <TouchableOpacity onPress={() => { setSelectedCategories([]); setSelectedSubcategories([]); }}>
                    <Text style={styles.catClearAll}>Clear all</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Category + subcategory rows grouped */}
              <View style={styles.catList}>
                {visibleCats.length === 0 && (
                  <Text style={styles.emptyHint}>No categories match "{categorySearch}"</Text>
                )}
                
                {Object.keys(grouped).map(groupName => {
                  const groupCats = grouped[groupName];
                  if (groupCats.length === 0) return null;

                  return (
                    <View key={groupName} style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {groupName}
                      </Text>
                      
                      {groupCats.map(cat => {
                        const catId = cat.id?.toString();
                        const catSelected = selectedCategories.includes(catId);
                        const subs = cat.subcategories || [];
                        const selectedSubCount = subs.filter(s => selectedSubcategories.includes(s.id?.toString())).length;

                        // Which subcategories to show
                        const visibleSubs = q
                          ? subs.filter(s => s.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q))
                          : (catSelected ? subs : []);

                        return (
                          <View key={catId}>
                            {/* Category row */}
                            <TouchableOpacity
                              style={styles.catRow}
                              onPress={() => toggleCategory(cat)}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.catCheckbox, catSelected && styles.catCheckboxActive]}>
                                {catSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                              </View>
                              <Text style={[styles.catRowText, catSelected && styles.catRowTextActive]} numberOfLines={1}>
                                {cat.name}
                              </Text>
                              {catSelected && selectedSubCount > 0 && (
                                <View style={styles.subCountPill}>
                                  <Text style={styles.subCountPillText}>{selectedSubCount}</Text>
                                </View>
                              )}
                            </TouchableOpacity>

                            {/* Subcategory rows */}
                            {visibleSubs.map(sub => {
                              const sid = sub.id?.toString();
                              const subSelected = selectedSubcategories.includes(sid);
                              return (
                                <TouchableOpacity
                                  key={sid}
                                  style={styles.subRow}
                                  onPress={() => toggleSubcategory(sid)}
                                  activeOpacity={0.7}
                                >
                                  <View style={styles.subRowIndent} />
                                  <View style={[styles.subCheckbox, subSelected && styles.subCheckboxActive]}>
                                    {subSelected && <Ionicons name="checkmark" size={11} color="#fff" />}
                                  </View>
                                  <Text style={[styles.subRowText, subSelected && styles.subRowTextActive]} numberOfLines={1}>
                                    {sub.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </>
          );
        })()}

        {/* Clothing Sizes */}
        <SectionHeader title="Clothing Sizes" subtitle="Select your preferred size system — used for search and listings" />
        <View style={styles.sizeSystemRow}>
          {['UK', 'US', 'EU'].map((sys) => (
            <TouchableOpacity
              key={sys}
              style={[styles.sizeSystemBtn, sizeSystem === sys && styles.sizeSystemBtnActive]}
              onPress={() => setSizeSystem(sys)}
            >
              <Text style={[styles.sizeSystemBtnText, sizeSystem === sys && styles.sizeSystemBtnTextActive]}>{sys}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SizeRow
          label="Shirt / Top"
          options={SHIRT_SIZES}
          value={shirtSize}
          onSelect={setShirtSize}
        />
        <SizeRow
          label="Jacket / Coat"
          options={JACKET_SIZES}
          value={jacketSize}
          onSelect={setJacketSize}
        />
        <View style={styles.sizeGroup}>
          <Text style={styles.sizeLabel}>Trousers / Jeans</Text>
          <View style={styles.sizeDoubleRow}>
            <View style={styles.sizeHalf}>
              <Text style={styles.sizeSubLabel}>Waist</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sizeRowInner}>
                  {TROUSER_WAISTS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sizeChip, trouserWaist === s && styles.sizeChipActive]}
                      onPress={() => setTrouserWaist(trouserWaist === s ? '' : s)}
                    >
                      <Text style={[styles.sizeChipText, trouserWaist === s && styles.sizeChipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={styles.sizeHalf}>
              <Text style={styles.sizeSubLabel}>Length</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sizeRowInner}>
                  {TROUSER_LENGTHS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sizeChip, trouserLength === s && styles.sizeChipActive]}
                      onPress={() => setTrouserLength(trouserLength === s ? '' : s)}
                    >
                      <Text style={[styles.sizeChipText, trouserLength === s && styles.sizeChipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
        <View style={styles.sizeGroup}>
          <Text style={styles.sizeLabel}>Shoes ({sizeSystem})</Text>
          <View style={{}}>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sizeRowInner}>
              {SHOE_SIZES[sizeSystem].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeChip, shoeSizeUK === s && styles.sizeChipActive]}
                  onPress={() => setShoeSizeUK(shoeSizeUK === s ? '' : s)}
                >
                  <Text style={[styles.sizeChipText, shoeSizeUK === s && styles.sizeChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        </View>

        {/* Colours */}
        <SectionHeader title="Preferred Colours" />
        <View style={styles.chipWrap}>
          {availableColors.map((col) => {
            const id = col.id?.toString();
            const active = selectedColors.includes(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleColor(id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{col.name}</Text>
              </TouchableOpacity>
            );
          })}
          {availableColors.length === 0 && (
            <Text style={styles.emptyHint}>Colours loading…</Text>
          )}
        </View>

        {/* Brands */}
        <SectionHeader title="Brand Preferences" subtitle="Up to 10 brands" />
        <View style={styles.brandInputRow}>
          <TextInput
            style={styles.brandInput}
            placeholder="e.g. Nike, Zara, ASOS…"
            placeholderTextColor="#aaa"
            value={brandInput}
            onChangeText={setBrandInput}
            onSubmitEditing={addBrand}
            returnKeyType="done"
            maxLength={40}
          />
          <TouchableOpacity style={styles.brandAddBtn} onPress={addBrand} disabled={brands.length >= 10}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {brands.length > 0 && (
          <View style={styles.chipWrap}>
            {brands.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.chip, styles.chipActive, styles.chipBrand]}
                onPress={() => removeBrand(b)}
              >
                <Text style={styles.chipTextActive}>{b}</Text>
                <Ionicons name="close" size={12} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quality */}
        <SectionHeader title="Quality Preference" />
        <View style={styles.chipWrap}>
          {QUALITY_OPTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={[styles.chip, qualityPreference === q.id && styles.chipActive]}
              onPress={() => setQualityPreference(q.id)}
            >
              <Text style={[styles.chipText, qualityPreference === q.id && styles.chipTextActive]}>
                {q.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Interests</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

const SizeRow = ({ label, options, value, onSelect }) => (
  <View style={styles.sizeGroup}>
    <Text style={styles.sizeLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.sizeRowInner}>
        {options.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sizeChip, value === s && styles.sizeChipActive]}
            onPress={() => onSelect(value === s ? '' : s)}
          >
            <Text style={[styles.sizeChipText, value === s && styles.sizeChipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <Ionicons name="chevron-back" size={28} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Interests</Text>
    <View style={styles.headerRight} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { width: 32 },

  scroll: { padding: 20, paddingBottom: 60 },

  sectionHeader: { marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  sectionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  // Category search bar
  catSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  catSearchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },

  // Selection summary
  catSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catSummaryText: { fontSize: 12, color: '#888', fontWeight: '500' },
  catClearAll: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // List container
  catList: {
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Category row
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  catCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  catCheckboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  catRowText: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  catRowTextActive: { color: COLORS.primary, fontWeight: '600' },
  subCountPill: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  subCountPillText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Subcategory row (indented)
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
    backgroundColor: '#fafcff',
  },
  subRowIndent: { width: 22 },
  subCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  subCheckboxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  subRowText: { flex: 1, fontSize: 13, color: '#555', fontWeight: '400' },
  subRowTextActive: { color: COLORS.primary, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipBrand: { paddingRight: 10 },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  emptyHint: { fontSize: 13, color: '#bbb', fontStyle: 'italic' },

  sizeGroup: { marginBottom: 14 },
  sizeLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  sizeSystemRow: { flexDirection: 'row', marginBottom: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden', alignSelf: 'flex-start' },
  sizeSystemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sizeSystemToggle: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  sizeSystemBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fafafa' },
  sizeSystemBtnActive: { backgroundColor: COLORS.primary },
  sizeSystemBtnText: { fontSize: 12, fontWeight: '600', color: '#555' },
  sizeSystemBtnTextActive: { color: '#fff' },
  sizeSubLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  sizeDoubleRow: { flexDirection: 'row', gap: 16 },
  sizeHalf: { flex: 1 },
  sizeRowInner: { flexDirection: 'row', gap: 6, paddingRight: 16 },
  sizeChip: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  sizeChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  sizeChipText: { fontSize: 13, fontWeight: '500', color: '#555' },
  sizeChipTextActive: { color: '#fff', fontWeight: '700' },

  brandInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  brandInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  brandAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});

export default InterestScreen;
