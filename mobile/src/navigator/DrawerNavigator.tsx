import { createDrawerNavigator } from "@react-navigation/drawer";
import { useWindowDimensions } from "react-native";
import { DrawerMenu } from "../components/DrawerMenu";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "../screens/HomeScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { CreateProductScreen } from "../screens/CreateProductScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";

export type RootDrawerNavigator = {
    Home: undefined;
    CreateProduct: undefined;
    Profile: undefined;
    Auth: undefined;
}

const HomeStack = createStackNavigator();
const CreateProductStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const AuthStack = createStackNavigator();

const HomeStackNav = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
        <HomeStack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
    </HomeStack.Navigator>
);

const CreateProductStackNav = () => (
    <CreateProductStack.Navigator screenOptions={{ headerShown: false }}>
        <CreateProductStack.Screen name="CreateProductScreen" component={CreateProductScreen} />
    </CreateProductStack.Navigator>
);

const ProfileStackNav = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </ProfileStack.Navigator>
);

const AuthStackNav = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
        <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
);

const Navigator = () => {
    const Drawer = createDrawerNavigator<RootDrawerNavigator>();
    const { width } = useWindowDimensions();

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: true,
                drawerType: width >= 768 ? "permanent" : "front",
                drawerPosition: "left",
                drawerStyle: {
                    backgroundColor: "white",
                    width: width * 0.7
                }
            }}
            drawerContent={(props) => <DrawerMenu {...props} />}
        >
            <Drawer.Screen
                name="Home"
                component={HomeStackNav}
                options={{ title: "JODAXI" }}
            />
            <Drawer.Screen
                name="CreateProduct"
                component={CreateProductStackNav}
                options={{ title: "Publicar Producto" }}
            />
            <Drawer.Screen
                name="Profile"
                component={ProfileStackNav}
                options={{ title: "Mi Perfil" }}
            />
            <Drawer.Screen
                name="Auth"
                component={AuthStackNav}
                options={{ title: "Iniciar Sesión", drawerItemStyle: { display: 'none' } }}
            />
        </Drawer.Navigator>
    );
}

export const DrawerNavigator = () => {
    return (
        <Navigator />
    );
}
