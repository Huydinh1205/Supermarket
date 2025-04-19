import { createContext, useContext, useReducer } from "react";
import { useEffect } from "react";
const initialState = {
  isAuthenticated: false,
  isInitialized: true,
  user: null,
};

const INITIALIZE = "INITIALIZE";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGOUT = "LOGOUT";

const reducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isAuthenticated,
        isInitialized: true,
        user,
      };
    case LOGIN_SUCCESS:
      console.log(!state.isAuthenticated);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext({ ...initialState });

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const initialize = async () => {
      try {
        const username = window.localStorage.getItem("username");

        if (username) {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user: { username } },
          });
        } else {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };
    initialize();
  }, []);

  const login = async (username, password, callback) => {
    const storedUser = JSON.parse(window.localStorage.getItem("users"));
  
    if (
      storedUser &&
      storedUser.username === username &&
      storedUser.password === password
    ) {
      window.localStorage.setItem("username", username);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: { username } },
      });
      callback();
    } else {
      alert("Invalid username or password");
    }
  };
  

  const signup = async (username, password, callback) => {
    const newUser = { username, password };
    window.localStorage.setItem("users", JSON.stringify(newUser));
    window.localStorage.setItem("username", username); // Optional auto-login
    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user: { username } },
    });
    callback();
  };

  const logout = async (callback) => {
    window.localStorage.removeItem("username");
    dispatch({ type: LOGOUT });
    callback();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};