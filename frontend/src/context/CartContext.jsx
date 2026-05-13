import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

// The starting state of an empty cart
const initialState = {
  items:         [],    // products added to the cart
  customer:      null,  // the selected customer
  extraDiscount: 0,     // order-level flat discount in KES
  notes:         '',    // any cashier notes
};

// The reducer handles every possible cart action
function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_ITEM': {
      // If product already in cart, increase quantity instead of adding duplicate
      const existing = state.items.find(
        (i) => i.product.id === action.payload.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      // New product — add it with quantity 1 and zero discount
      return {
        ...state,
        items: [
          ...state.items,
          { product: action.payload, quantity: 1, discount_pct: 0 },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      // If quantity reaches 0, remove the item completely
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      };
    }

    case 'UPDATE_ITEM_DISCOUNT':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.productId
            ? { ...i, discount_pct: action.payload.discount_pct }
            : i
        ),
      };

    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };

    case 'SET_EXTRA_DISCOUNT':
      return { ...state, extraDiscount: parseFloat(action.payload) || 0 };

    case 'SET_NOTES':
      return { ...state, notes: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // These functions are what components call — they dispatch actions
  const addItem = (product) =>
    dispatch({ type: 'ADD_ITEM', payload: product });

  const removeItem = (productId) =>
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

  const updateQuantity = (productId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });

  const updateItemDiscount = (productId, discount_pct) =>
    dispatch({ type: 'UPDATE_ITEM_DISCOUNT', payload: { productId, discount_pct } });

  const setCustomer      = (customer) => dispatch({ type: 'SET_CUSTOMER',      payload: customer });
  const setExtraDiscount = (amount)   => dispatch({ type: 'SET_EXTRA_DISCOUNT', payload: amount  });
  const setNotes         = (notes)    => dispatch({ type: 'SET_NOTES',          payload: notes   });
  const clearCart        = ()         => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{
      cart,
      addItem,
      removeItem,
      updateQuantity,
      updateItemDiscount,
      setCustomer,
      setExtraDiscount,
      setNotes,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}