import fs from 'fs';
import path from 'path';
import sequelize from './database';
import { Product, Category, ProductCategory, initDatabase, Setting } from './models';

const SCRATCH_PATH = '/Users/flymedia/.gemini/antigravity-ide/brain/2242e8b3-dac7-4555-9db1-f74f2fe51607/scratch';

async function seed() {
  console.log('Synchronizing database (force=true)...');
  await initDatabase(true);

  const seededProductIds = new Set<number>();
  const seededCategoryIds = new Set<number>();

  // 1. Load Categories
  const categoriesFile = path.join(SCRATCH_PATH, 'parsed_categories.json');
  if (fs.existsSync(categoriesFile)) {
    console.log('Loading categories...');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    console.log(`Found ${categoriesData.length} categories to seed.`);

    const formattedCategories = categoriesData.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: '',
      image: '',
    }));

    formattedCategories.forEach((c: any) => seededCategoryIds.add(c.id));

    await Category.bulkCreate(formattedCategories);
    console.log('Categories seeded.');
  }

  // 2. Load Products
  const productsFile = path.join(SCRATCH_PATH, 'parsed_products.json');
  if (fs.existsSync(productsFile)) {
    console.log('Loading products...');
    const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`Found ${productsData.length} products to seed.`);

    // Clean up prices (if string, parse float)
    const formattedProducts = productsData.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      excerpt: p.excerpt,
      price: typeof p.price === 'string' ? parseFloat(p.price) || 0.0 : p.price,
      regularPrice: typeof p.regularPrice === 'string' ? parseFloat(p.regularPrice) || 0.0 : p.regularPrice,
      salePrice: typeof p.salePrice === 'string' ? parseFloat(p.salePrice) || null : p.salePrice,
      sku: p.sku || '',
      stock: p.stock || 0,
      stockStatus: p.stockStatus || 'instock',
      weight: p.weight || 0.0,
      image: p.image || '',
    }));

    formattedProducts.forEach((p: any) => seededProductIds.add(p.id));

    await Product.bulkCreate(formattedProducts);
    console.log('Products seeded.');
  }

  // 3. Load Product Category Relationships
  const relsFile = path.join(SCRATCH_PATH, 'parsed_product_categories.json');
  if (fs.existsSync(relsFile)) {
    console.log('Loading product-category relationships...');
    const relsData = JSON.parse(fs.readFileSync(relsFile, 'utf8'));
    console.log(`Found ${relsData.length} relationships to seed.`);

    const formattedRels = relsData
      .filter((r: any) => seededProductIds.has(r.productId) && seededCategoryIds.has(r.categoryId))
      .map((r: any) => ({
        productId: r.productId,
        categoryId: r.categoryId,
      }));

    // Filter duplicates just in case
    const uniqueRels: { [key: string]: any } = {};
    formattedRels.forEach((r: any) => {
      const key = `${r.productId}-${r.categoryId}`;
      uniqueRels[key] = r;
    });

    await ProductCategory.bulkCreate(Object.values(uniqueRels));
    console.log('Product-category relationships seeded.');
  }

  // 4. Load Pages as Settings or separate data if needed (we'll save pages to Settings model for quick retrieval of content blocks, or mock them)
  const pagesFile = path.join(SCRATCH_PATH, 'parsed_pages.json');
  if (fs.existsSync(pagesFile)) {
    console.log('Loading pages...');
    const pagesData = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
    console.log(`Found ${pagesData.length} pages to seed.`);

    const pageSettings = pagesData.map((p: any) => ({
      key: `page_content_${p.slug}`,
      value: JSON.stringify({
        id: p.id,
        title: p.title,
        content: p.content,
      }),
    }));

    const hasPrivacyPolicy = pagesData.some((p: any) => p.slug === 'privacy-policy');
    if (!hasPrivacyPolicy) {
      console.log('Privacy Policy page not found in dump. Generating default privacy policy...');
      const privacyContent = `
        <p>Last updated: May 23, 2026</p>
        <p>At <strong>Bayton Horticulture Centre</strong>, accessible from <a href="https://baytonhorticulturecentre.co.uk">https://baytonhorticulturecentre.co.uk</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Bayton Horticulture Centre and how we use it.</p>
        
        <h3>1. Personal Information We Collect</h3>
        <p>When you purchase products from our store, request shipping quotes, or submit contact inquiries, we collect the personal information you give us, such as:</p>
        <ul>
          <li>Name and contact details (email, phone number)</li>
          <li>Billing and shipping addresses</li>
          <li>Details of the products you order</li>
        </ul>

        <h3>2. How We Use Your Information</h3>
        <p>We use the collected information in various ways, including to:</p>
        <ul>
          <li>Process, fulfill, and ship your orders through our courier partners (like APC Overnight).</li>
          <li>Calculate accurate weight-based and postcode-based shipping rates.</li>
          <li>Understand and analyze how you use our website to improve user experience.</li>
          <li>Respond to contact requests, feedback, or support inquiries.</li>
          <li>Prevent fraud and secure transactions.</li>
        </ul>

        <h3>3. Marketing and Analytics Tags</h3>
        <p>Our website utilizes conversion and tracking pixels to optimize our online marketing campaigns, including:</p>
        <ul>
          <li><strong>TikTok Conversion Pixel</strong>: Tracks conversion events (like page views, cart additions, and checkouts) to measure TikTok campaign efficiency.</li>
          <li><strong>Pinterest Tag</strong>: Measures the conversion actions of users visiting from Pinterest.</li>
        </ul>
        <p>These tags gather anonymous usage data. You can opt-out of behavioral targeting through your browser settings or specialized ad-choice panels.</p>

        <h3>4. Sharing Your Information</h3>
        <p>We only share your information with trusted third-party service providers to perform necessary operations, including:</p>
        <ul>
          <li><strong>APC Overnight</strong>: To book deliveries, compute shipping costs, and generate tracking numbers.</li>
          <li><strong>Payment Processors</strong>: Secure credit card processing.</li>
        </ul>
        <p>We do not sell, rent, or trade your personal data to third parties for marketing purposes.</p>

        <h3>5. Cookies</h3>
        <p>We use cookies to maintain your shopping cart state, store user sessions, and track web analytics. You can choose to disable cookies through your individual browser options.</p>

        <h3>6. Data Security</h3>
        <p>We use industry-standard encryption protocols (SSL/HTTPS) to secure all data transmissions. Credit card transactions are processed securely under strict PCI compliance guidelines.</p>

        <h3>7. Contact Us</h3>
        <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us:</p>
        <p>
          Bayton Horticulture Centre<br />
          Bayton Road Industrial Estate,<br />
          Coventry, West Midlands, CV7 9EL<br />
          Email: <a href="mailto:sales@baytonhorticulture.co.uk">sales@baytonhorticulture.co.uk</a>
        </p>
      `;

      pageSettings.push({
        key: 'page_content_privacy-policy',
        value: JSON.stringify({
          id: 9999,
          title: 'Privacy Policy',
          content: privacyContent,
        }),
      });
    }

    await Setting.bulkCreate(pageSettings, { updateOnDuplicate: ['value'] });
    console.log('Pages content stored in Settings.');
  }

  // 5. Initial Plugin Configuration Settings
  console.log('Setting up default configuration keys...');
  const defaultSettings = [
    { key: 'apc_api_key', value: 'MOCK_APC_KEY_12345' },
    { key: 'apc_account_number', value: 'APC_ACC_98765' },
    { key: 'apc_base_shipping_rate', value: '12.50' }, // GBP
    { key: 'apc_per_kg_rate', value: '1.20' }, // GBP
    { key: 'google_shopping_merchant_id', value: '123456789' },
    { key: 'google_shopping_portal_feed_url', value: '/api/google-shopping' },
    { key: 'tiktok_pixel_id', value: 'CTIKTOK123456' },
    { key: 'pinterest_tag_id', value: 'PINTAG789012' },
  ];

  await Setting.bulkCreate(defaultSettings, { updateOnDuplicate: ['value'] });
  console.log('Default settings initialized.');

  console.log('Seeding process completed successfully!');
  await sequelize.close();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
});
