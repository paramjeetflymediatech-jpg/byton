import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

// 1. Category Model
export class Category extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string | null;
  declare image: string | null;
}
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
  }
);

// 2. Product Model
export class Product extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare description: string | null;
  declare excerpt: string | null;
  declare price: number;
  declare regularPrice: number;
  declare salePrice: number | null;
  declare sku: string | null;
  declare stock: number;
  declare stockStatus: string; // 'instock', 'outofstock'
  declare weight: number; // in kg
  declare image: string | null;
}
Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    regularPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stockStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'instock',
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  }
);

// 3. ProductCategory Junction Model
export class ProductCategory extends Model {
  declare productId: number;
  declare categoryId: number;
}
ProductCategory.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Product,
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Category,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductCategory',
    tableName: 'product_categories',
    timestamps: false,
  }
);

// Define Many-to-Many Association
Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: 'productId',
  otherKey: 'categoryId',
  as: 'categories',
});
Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: 'categoryId',
  otherKey: 'productId',
  as: 'products',
});

// 4. Order Model
export class Order extends Model {
  declare id: string; // UUID or custom order number
  declare customerName: string;
  declare customerEmail: string;
  declare shippingAddress: string;
  declare shippingCity: string;
  declare shippingPostcode: string;
  declare shippingPhone: string;
  declare totalAmount: number;
  declare shippingCost: number;
  declare status: string; // 'pending', 'processing', 'completed', 'cancelled'
  declare apcTrackingNumber: string | null;
  declare apcLabelUrl: string | null;
}
Order.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingPostcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    shippingCost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    apcTrackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apcLabelUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
);

// 5. OrderItem Model
export class OrderItem extends Model {
  declare id: number;
  declare orderId: string;
  declare productId: number;
  declare productTitle: string;
  declare quantity: number;
  declare price: number;
}
OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: false,
  }
);

// Define Order/OrderItem Associations
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// 6. Setting Model (for configurations like APC Overnight API keys)
export class Setting extends Model {
  declare key: string;
  declare value: string;
}
Setting.init(
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings',
    timestamps: true,
  }
);

// Helper function to sync database tables
export async function initDatabase(force = false) {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error connecting to/syncing database:', error);
    throw error;
  }
}
