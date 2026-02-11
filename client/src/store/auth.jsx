import { createContext, useContext, useEffect, useState } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [machine, setMachine] = useState([]);
    const [driver, setDriver] = useState([]);
    const [invoice, setInvoice] = useState([]);
    const [clients, setClients] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [userData, setUserData] = useState(null);
    const [settings, setSettings] = useState({
        company: {},
        billing: { dateFormat: "DD-MM-YYYY" },
        bankDetails: [],
        terms: []
    });

    const [token, setToken] = useState(localStorage.getItem("token") || sessionStorage.getItem("token"));

    const storeToken = (serverToken, remember) => {
        if (remember) {
            localStorage.setItem("token", serverToken);
        } else {
            sessionStorage.setItem("token", serverToken);
        }
        setToken(serverToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setToken(null);
        setUserData(null);
    };

    const getMachines = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/machine`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMachine(data.msg);
            }
        } catch (error) {
        }
    };

    const getDriver = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/driver`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setDriver(data.msg);
            }
        } catch (error) {
        }
    };

    const getInvoices = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/invoice`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setInvoice(data.invoices);
                }
            }
        } catch (error) {
        }
    };

    const getClients = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/client`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const getRentals = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/rental`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRentals(data);
            }
        } catch (error) {
            console.error("Error fetching rentals:", error);
        }
    };

    const fetchUser = async () => {

        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/auth/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                // Sync with local storage user for other components using it
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));
            }
        } catch (error) {
        }
    };

    const getSettings = async () => {
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:7000/api/settings`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    useEffect(() => {
        if (token) {
            getMachines();
            getDriver();
            getInvoices();
            fetchUser();
            getClients();
            getRentals();
            getSettings();
        }
    }, [token]);


    return (
        <AuthContext.Provider value={{ machine, driver, invoice, clients, rentals, userData, settings, fetchUser, getSettings, storeToken, logout, token, getMachines, getDriver, getInvoices, getClients, getRentals }}>
            {children}
        </AuthContext.Provider>

    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the provider")
    }
    return authContextValue
}