import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CreateProductScreen } from '../screens/CreateProductScreen';
import { MyProductsScreen } from '../screens/MyProductsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChatsScreen } from '../screens/ChatsScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { colors } from '../themes/appTheme';

// Stack types
export type HomeStackParamList = {
    Home: undefined;
    ProductDetail: { productId: number };
    CreateProduct: undefined;
};

export type ProfileStackParamList = {
    Profile: undefined;
    MyProducts: undefined;
    CreateProduct: undefined;
    Favorites: undefined;
    Settings: undefined;
    Chats: undefined;
    ChatDetail: { chatId: number; userName: string; productId?: number; productName?: string };
    ProductDetail: { productId: number };
    AdminDashboard: undefined;
};

export type SearchStackParamList = {
    Search: undefined;
    ProductDetail: { productId: number };
};

// Stack Navigators
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();

const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="Home" component={HomeScreen} />
        <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <HomeStack.Screen name="CreateProduct" component={CreateProductScreen} />
    </HomeStack.Navigator>
);

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="Profile" component={ProfileScreen} />
        <ProfileStack.Screen name="MyProducts" component={MyProductsScreen} />
        <ProfileStack.Screen name="CreateProduct" component={CreateProductScreen} />
        <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
        <ProfileStack.Screen name="Settings" component={SettingsScreen} />
        <ProfileStack.Screen name="Chats" component={ChatsScreen} />
        <ProfileStack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <ProfileStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <ProfileStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </ProfileStack.Navigator>
);

const SearchStackNavigator = () => (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
        <SearchStack.Screen name="Search" component={SearchScreen} />
        <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </SearchStack.Navigator>
);

// Tab Navigator
export type RootTabNavigator = {
    HomeTab: undefined;
    SearchTab: undefined;
    ProfileTab: undefined;
}

const Tab = createBottomTabNavigator<RootTabNavigator>();

export const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    
                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'SearchTab') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeStackNavigator} 
                options={{ title: 'Inicio' }}
            />
            <Tab.Screen 
                name="SearchTab" 
                component={SearchStackNavigator} 
                options={{ title: 'Búsqueda' }}
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileStackNavigator} 
                options={{ title: 'Perfil' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
