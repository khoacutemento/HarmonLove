// import { createContext, useReducer, useEffect } from "react";

// const AuthContext = createContext();

// const authReducer = (state, action) => {
//   switch (action.type) {
//     case "LOGIN":
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//       };
//     case "LOGOUT":
//       return { ...state, user: null, token: null, isAuthenticated: false };
//     default:
//       return state;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, {
//     user: JSON.parse(localStorage.getItem("user")) || null,
//     token: localStorage.getItem("token") || null,
//     isAuthenticated: !!localStorage.getItem("token"),
//   });

//   useEffect(() => {
//     if (state.token) {
//       localStorage.setItem("token", state.token);
//       localStorage.setItem("user", JSON.stringify(state.user));
//     } else {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     }
//   }, [state.token]);

//   return (
//     <AuthContext.Provider value={{ state, dispatch }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
