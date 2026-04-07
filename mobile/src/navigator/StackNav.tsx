import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "../screens/HomeScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { CreateProductScreen } from "../screens/CreateProductScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MyProductsScreen } from "../screens/MyProductsScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ChatsScreen } from "../screens/ChatsScreen";
import { ChatDetailScreen } from "../screens/ChatDetailScreen";

export type RootStackNavigator = {
    HomeScreen: undefined;
    ProductDetailScreen: { productId: number };
    CreateProductScreen: undefined;
    ProfileScreen: undefined;
    MyProductsScreen: undefined;
    FavoritesScreen: undefined;
    SettingsScreen: undefined;
    ChatsScreen: undefined;
    ChatDetailScreen: { chatId: number; userName: string; productId?: number; productName?: string };
}

const Stack = createStackNavigator<RootStackNavigator>();

export const StackNav = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: {
                    backgroundColor: 'white'
                }
            }}
            initialRouteName="HomeScreen"
        >
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="CreateProductScreen" component={CreateProductScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="MyProductsScreen" component={MyProductsScreen} />
            <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
            <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
        </Stack.Navigator>
    );
}
