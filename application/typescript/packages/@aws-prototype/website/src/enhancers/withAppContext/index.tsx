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
import { FC, createContext, useCallback, useContext, useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '@aws-prototype/shared-types';
import QueryClient from 'containers/QueryClient';

export interface AppContextApi {
  user?: User;
  signOut: () => void;
}

const initialState: AppContextApi = {
  signOut: () => {},
};

const AppContext = createContext<AppContextApi>(initialState);

const AppContextProvider: FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(false);

  const initializeUser = async () => {
    setLoading(true);
    try {
      const user: {
        username: string;
        attributes?: {
          given_name: string;
        };
      } = await Auth.currentAuthenticatedUser();

      setUser({
        username: user.username,
        displayName: user?.attributes?.given_name,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const signOut = useCallback(() => {
    setLoading(true);
    Auth.signOut()
      .then(() => {
        setUser(undefined);
        window.location.href = '/';
      })
      .catch((e) => {
        console.error('Error in SignOut', e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <AppContext.Provider
      value={{
        user,
        signOut,
      }}
    >
      {!loading && children}
    </AppContext.Provider>
  );
};

const withAppContext =
  (Component: FC) =>
  ({ ...props }) => {
    return (
      <AppContextProvider>
        <QueryClient>
          <Component {...props} />
        </QueryClient>
      </AppContextProvider>
    );
  };

export default withAppContext;

export const useAppContext = () => useContext(AppContext);
