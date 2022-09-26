/**********************************************************************************************************************
Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the
specific language governing permissions and limitations under the License.   
 **********************************************************************************************************************/
import { FC, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';
import AppLayout from 'aws-northstar/layouts/AppLayout';
import Box from 'aws-northstar/layouts/Box';
import Header from 'aws-northstar/components/Header';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import SideNavigation from 'aws-northstar/components/SideNavigation';
import BreadcrumbGroup from 'aws-northstar/components/BreadcrumbGroup';

import routes from 'routes';
import navigationTemplate from 'config/navigation';
import { NAV_HEADER, HEADER, SIGN_OUT } from 'config/resourceStrings';
import withAuthenticator from 'enhancers/withAuthenticator';
import withAppContext, { useAppContext } from 'enhancers/withAppContext';

const App: FC = () => {
  const { user, signOut } = useAppContext();
  const headerRightContent = useMemo(() => (
    <Box display="flex" alignItems="center">
        <ButtonDropdown content={user?.displayName || 'User'} items={[{ text: SIGN_OUT, onClick: signOut }]} darkTheme />
    </Box>
  ), [user,  signOut]);
  const header = useMemo(() => <Header title={HEADER} rightContent={headerRightContent}/>, [headerRightContent]);
  const navigation = useMemo(
    () => (
      <SideNavigation
        header={{
          href: '/',
          text: NAV_HEADER,
        }}
        items={navigationTemplate}
      />
    ),
    [],
  );

  const breadcrumbs = useMemo(() => <BreadcrumbGroup availableRoutes={routes}/>, []);

  return (
    <NorthStarThemeProvider>
        <Router>
          <AppLayout header={header} navigation={navigation} breadcrumbs={breadcrumbs}>
            <Switch>
              {routes.map((route) => (
                <Route key={route.path} exact={true} path={route.path} component={route.Component} />
              ))}
              <Redirect to='/'/>
            </Switch>
          </AppLayout>
        </Router>
    </NorthStarThemeProvider>
  );
};

export default withAuthenticator(withAppContext(App));
