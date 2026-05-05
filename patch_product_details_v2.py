import sys

file_path = "src/screens/products/ProductDetailsScreen.js"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

jsx_start_idx = -1
jsx_end_idx = -1

# Find start
for i, line in enumerate(lines):
    if "{/* Product Info */}" in line and "styles.productInfo" in lines[i+1]:
        jsx_start_idx = i
        break

# Find end
for i in range(jsx_start_idx, len(lines)):
    if "{/* Info Modal */}" in lines[i]:
        jsx_end_idx = i - 1 # End before Info Modal
        break

if jsx_start_idx != -1 and jsx_end_idx != -1:
    new_jsx = """        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleRowContainer}>
            <Text style={styles.productTitle}>{productData.title}</Text>
            <Text style={styles.titleSubText}>size {productData.size || '42'}</Text>
            <Text style={styles.titleSubTextBold}>{productData.condition}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.productPriceText}>{productData.price}</Text>
            <View style={styles.buyerFeeRow}>
              <Text style={styles.buyerFeeText}>{calculatePriceWithFee(productData.price)} with Buyer's Fee</Text>
              <Ionicons name="shield-checkmark-outline" size={12} color="#505050" style={{marginLeft: 4}} />
            </View>
          </View>
        </View>

        {/* Description & Product Details */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('Description')}</Text>
          <Text style={styles.descriptionText} numberOfLines={isDescriptionExpanded ? undefined : 2}>
            {productData.description || 'A wonderful armchair with brown covering and black legs. Hardly used. Massive wood...'}
          </Text>
          
          {isDescriptionExpanded && (
            <View style={styles.detailsList}>
              <DetailRow label={t('Category')} value={productData.category} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Distance')} value={productData.distanceMeters} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Price')} value={productData.price} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Condition')} value={productData.condition} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Gender')} value={productData.gender} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Age')} value={productData.age} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Size')} value={productData.size} onInfoPress={handleInfoPress} />
              <DetailRow label={t('Colour')} value={productData.colour} onInfoPress={handleInfoPress} />
            </View>
          )}
          <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)} style={styles.moreInfoButton}>
            <Text style={styles.linkTextBlue}>{isDescriptionExpanded ? t('hide info') : t('more info')}</Text>
          </TouchableOpacity>
        </View>

        {/* User Statistics */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('User statistics')}</Text>
          <Text style={styles.descriptionText} numberOfLines={isUserStatsExpanded ? undefined : 2}>
            Lorem: Lorem ipsum dolores est, lorem ipsum.
            Lorem: Lorem ipsum dolores est, lorem ipsum.
            Lorem: Lorem ipsum dolores est, lorem ipsum.
            Lorem: Lorem ipsum dolores est, lorem ipsum.
            Lorem: Lorem ipsum dolores est, lorem ipsum.
          </Text>
          <TouchableOpacity onPress={() => setIsUserStatsExpanded(!isUserStatsExpanded)} style={styles.moreInfoButton}>
             <Text style={styles.linkTextBlue}>{isUserStatsExpanded ? t('hide info') : t('more info')}</Text>
          </TouchableOpacity>

          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {productData.seller?.avatar ? (
                <Image
                  source={{ uri: getFullImageUrl(productData.seller.avatar) }}
                  style={styles.sellerAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome name="user" size={24} color="#505050" />
              )}
            </View>
            <View style={styles.sellerInfoOuter}>
              <View style={styles.sellerInfoRow}>
                <Text style={styles.sellerName}>{productData.seller?.username}</Text>
              </View>
              {productData.seller?.rating >= 0 && (
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                     <FontAwesome
                      key={star}
                      name={star <= 4.5 ? "star" : "star-o"}
                      size={14}
                      color="#FFD700"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              )}
            </View>
            <View style={styles.sellerLinksRight}>
              <TouchableOpacity onPress={handleReadFeedbacks}>
                <Text style={styles.sellerLinkTextSmall}>{t('Read Feedbacks')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUserListings} style={{ marginTop: 4 }}>
                <Text style={styles.sellerLinkTextSmall}>{t('View Listings')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.chatWithSellerButtonGray} onPress={handleChatWithSeller}>
            <Text style={styles.chatWithSellerButtonText}>{t('Chat now')}</Text>
          </TouchableOpacity>
        </View>

        {/* Resale Disclaimer */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t('Resale Disclaimer')}</Text>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolores est, lorem ipsum dolores es, lorem ipsum dolores est, lorem ipsum...
            + Refund Policy + Consumer Act for secondd hand C2C and B2C.
          </Text>
          <TouchableOpacity style={styles.moreInfoButton}>
             <Text style={styles.linkTextBlue}>{t('more info')}</Text>
          </TouchableOpacity>
        </View>

        {/* Buyer's Fee Disclaimer */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitleSmall}>{t("Buyer's Fee")}</Text>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolores est, lorem ipsum dolores es, lorem ipsum dolores est, lorem ipsum...
          </Text>
          <TouchableOpacity style={styles.moreInfoButton}>
             <Text style={styles.linkTextBlue}>{t('more info')}</Text>
          </TouchableOpacity>
        </View>

        {/* HomeMarket & ShowCasing Tabs */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'HomeMarket' && styles.activeTabButton]}
              onPress={() => setActiveTab('HomeMarket')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'HomeMarket' && styles.activeTabButtonText]}>HomeMarket</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'ShowCasing' && styles.activeTabButton]}
              onPress={() => setActiveTab('ShowCasing')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'ShowCasing' && styles.activeTabButtonText]}>ShowCasing</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.garageText}>Garage by {productData.seller?.username || 'User'}</Text>
          <View style={styles.gridContainer}>
             {(activeTab === 'HomeMarket' ? homeMarketProducts : showcaseProducts).map((item, index) => (
                <View key={index} style={styles.gridItem}>
                  <TouchableOpacity 
                    onPress={() => navigation.push('ProductDetails', { advertisementId: item.id })}
                  >
                    <Image source={{uri: getFullImageUrl(item.images?.[0])}} style={styles.gridItemImage} defaultSource={IMAGES.placeholder} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.gridItemHeart}>
                     <FontAwesome name="heart" size={16} color="#505050" />
                  </TouchableOpacity>
                  <Text style={styles.gridItemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.gridItemPrice}>£{item.price}</Text>
                  <Text style={styles.gridItemDistance}>Distance: {item.distance ? parseFloat(item.distance).toFixed(0) : 600} m / 7 min walk</Text>
                </View>
             ))}
          </View>
          <TouchableOpacity style={styles.locationDisclaimerLink}>
            <Text style={styles.footerDisclaimerText}>
              Our <Text style={styles.linkTextBlue}>Location & Safety Disclaimers</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.stickyFooter}>
        <View style={styles.bottomButtonsFooter}>
          <TouchableOpacity
            style={styles.makeOfferButtonFooter}
            onPress={handleMakeOffer}
          >
            <Text style={styles.makeOfferButtonTextFooter}>{t('Make offer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButtonFooter} onPress={handleBuy}>
            <Text style={styles.buyNowButtonTextFooter}>{t('Buy')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerDisclaimerTextBottom}>
          Our <Text style={styles.linkTextBlue}>Buyer's Fee & Disclaimers</Text>
        </Text>
      </View>
"""
    lines[jsx_start_idx:jsx_end_idx+1] = [new_jsx + "\n"]
    print(f"Successfully replaced JSX from line {jsx_start_idx} to {jsx_end_idx}")
else:
    print(f"Error: Could not find JSX bounds. start={jsx_start_idx} end={jsx_end_idx}")

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Patch applied successfully.")
