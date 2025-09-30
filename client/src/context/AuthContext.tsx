import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';


interface AuthContextType {
  user: JwtPayload | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: any) => {

const [user, setUser] = useState<JwtPayload | null>(null);


useEffect(() => {
const token = localStorage.getItem('token');
if (token) {
const decoded = jwtDecode(token);
setUser(decoded);
}
}, []);


const login = (token: string) => {
localStorage.setItem('token', token);
const decoded = jwtDecode(token);
setUser(decoded);
};


const logout = () => {
localStorage.removeItem('token');
setUser(null);
};


return (
<AuthContext.Provider value={{ user, login, logout }}>
{children}
</AuthContext.Provider>
);
};


export const useAuth = () => useContext(AuthContext);