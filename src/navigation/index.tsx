// Navigation graph — Auth Stack + Main Tab navigator.
// Custom floating TabBar — React Navigation'ın default bar'ı yerine bizim
// pill component'imizi kullanıyoruz (TabBar.tsx).
//
//   Auth gating: user yoksa Login flow, varsa direkt Main
//   Main Tab:    Home / Assignments / Report / Profile
//   Home Stack:  Assignments → Detail → Compose → Evaluating → Results*
//   Assignments Stack: AllTasks → same deep flow

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';

import TabBar, { TabId } from '@/components/TabBar';
import { useAuth }       from '@/context/AuthContext';
import { colors }        from '@/theme';

import OnboardingWelcome from '@/screens/OnboardingWelcome';
import OnboardingLevel   from '@/screens/OnboardingLevel';
import Login             from '@/screens/Login';

import Assignments       from '@/screens/Assignments';
import AssignmentDetail  from '@/screens/AssignmentDetail';
import Compose           from '@/screens/Compose';
import Evaluating        from '@/screens/Evaluating';
import ResultsOverview   from '@/screens/ResultsOverview';
import ResultsWriting    from '@/screens/ResultsWriting';
import ResultsTask       from '@/screens/ResultsTask';
import ResultsCohesion   from '@/screens/ResultsCohesion';
import ResultsLexical    from '@/screens/ResultsLexical';
import ResultsGrammar    from '@/screens/ResultsGrammar';

import AllTasks    from '@/screens/AllTasks';
import Progress    from '@/screens/Progress';
import Profile     from '@/screens/Profile';
import ErrorScreen from '@/screens/Error';

import type {
  RootStackParamList, TabParamList,
  HomeStackParamList, AssignmentsStackParamList,
  ReportStackParamList, ProfileStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab       = createBottomTabNavigator<TabParamList>();

const HomeStack        = createNativeStackNavigator<HomeStackParamList>();
const AssignmentsStack = createNativeStackNavigator<AssignmentsStackParamList>();
const ReportStack      = createNativeStackNavigator<ReportStackParamList>();
const ProfileStack     = createNativeStackNavigator<ProfileStackParamList>();

const noHeader = { headerShown: false } as const;


function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={noHeader}>
      <HomeStack.Screen name="Assignments" component={Assignments}/>
      <HomeStack.Screen name="AssignmentDetail" component={AssignmentDetail}/>
      <HomeStack.Screen name="Compose"          component={Compose}/>
      <HomeStack.Screen name="Evaluating"       component={Evaluating}/>
      <HomeStack.Screen name="ResultsOverview"  component={ResultsOverview}/>
      <HomeStack.Screen name="ResultsWriting"   component={ResultsWriting}/>
      <HomeStack.Screen name="ResultsTask"      component={ResultsTask}/>
      <HomeStack.Screen name="ResultsCohesion"  component={ResultsCohesion}/>
      <HomeStack.Screen name="ResultsLexical"   component={ResultsLexical}/>
      <HomeStack.Screen name="ResultsGrammar"   component={ResultsGrammar}/>
      <HomeStack.Screen name="Error"            component={ErrorScreen}/>
    </HomeStack.Navigator>
  );
}

function AssignmentsNavigator() {
  return (
    <AssignmentsStack.Navigator screenOptions={noHeader}>
      <AssignmentsStack.Screen name="AllTasks"         component={AllTasks}/>
      <AssignmentsStack.Screen name="AssignmentDetail" component={AssignmentDetail}/>
      <AssignmentsStack.Screen name="Compose"          component={Compose}/>
      <AssignmentsStack.Screen name="Evaluating"       component={Evaluating}/>
      <AssignmentsStack.Screen name="ResultsOverview"  component={ResultsOverview}/>
      <AssignmentsStack.Screen name="ResultsWriting"   component={ResultsWriting}/>
      <AssignmentsStack.Screen name="ResultsTask"      component={ResultsTask}/>
      <AssignmentsStack.Screen name="ResultsCohesion"  component={ResultsCohesion}/>
      <AssignmentsStack.Screen name="ResultsLexical"   component={ResultsLexical}/>
      <AssignmentsStack.Screen name="ResultsGrammar"   component={ResultsGrammar}/>
      <AssignmentsStack.Screen name="Error"            component={ErrorScreen}/>
    </AssignmentsStack.Navigator>
  );
}

function ReportNavigator() {
  return (
    <ReportStack.Navigator screenOptions={noHeader}>
      <ReportStack.Screen name="Report" component={Progress}/>
    </ReportStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={noHeader}>
      <ProfileStack.Screen name="Profile" component={Profile}/>
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={noHeader}
      tabBar={({ state, navigation }) => {
        const idMap: Record<string, TabId> = {
          HomeStack: 'Home', AssignmentsStack: 'Assignments',
          ReportStack: 'Report', ProfileStack: 'Profile',
        };
        const active = (idMap[state.routes[state.index].name] ?? 'Home') as TabId;
        return (
          <TabBar
            active={active}
            onChange={(id) => {
              const reverse: Record<TabId, keyof TabParamList> = {
                Home: 'HomeStack', Assignments: 'AssignmentsStack',
                Report: 'ReportStack', Profile: 'ProfileStack',
              };
              navigation.navigate(reverse[id]);
            }}
          />
        );
      }}
    >
      <Tab.Screen name="HomeStack"        component={HomeNavigator}/>
      <Tab.Screen name="AssignmentsStack" component={AssignmentsNavigator}/>
      <Tab.Screen name="ReportStack"      component={ReportNavigator}/>
      <Tab.Screen name="ProfileStack"     component={ProfileNavigator}/>
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgApp }}>
        <ActivityIndicator color={colors.brandBlue}/>
      </View>
    );
  }

  return (
    <NavigationContainer theme={{
      dark: false,
      colors: {
        primary: colors.brandBlue,
        background: colors.bgApp,
        card: colors.bgCard,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.brandBlue,
      },
      fonts: {
        regular: { fontFamily: 'Manrope_500Medium',    fontWeight: '400' },
        medium:  { fontFamily: 'Manrope_600SemiBold',  fontWeight: '500' },
        bold:    { fontFamily: 'Manrope_700Bold',       fontWeight: '700' },
        heavy:   { fontFamily: 'Manrope_800ExtraBold',  fontWeight: '800' },
      },
    }}>
      <RootStack.Navigator screenOptions={noHeader}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs}/>
        ) : (
          <>
            <RootStack.Screen name="OnboardingWelcome" component={OnboardingWelcome}/>
            <RootStack.Screen name="OnboardingLevel"   component={OnboardingLevel}/>
            <RootStack.Screen name="Login"             component={Login}/>
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
