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
import {Dispatch, FC, useCallback, useState} from 'react';
import Alert from 'aws-northstar/components/Alert';
import {UseMutateFunction} from 'react-query';
import NorthStarDeleteConfirmationDialog from 'aws-northstar/advanced/DeleteConfirmationDialog';
import {useNavigate} from 'react-router-dom';

export interface DeleteConfirmationModalProps {
    name: string;
    idObj: any,
    mutate: UseMutateFunction<unknown, Error, unknown, unknown>;
    visible: boolean;
    setVisible: Dispatch<React.SetStateAction<boolean>>;
    navPath?: string;
}

const DeleteConfirmationDialog: FC<DeleteConfirmationModalProps> =
    ({
        name,
        idObj,
        mutate,
        navPath,
        visible,
        setVisible
    }) => {
        const [isDeleting, setIsDeleting] = useState(false);
        const [errorText, setErrorText ] = useState<string>();
        const navigate = useNavigate();

        const handleConfirmDelete = useCallback(() => {
            setErrorText(undefined);
            setIsDeleting(true);
            mutate(idObj, {
                onSuccess: () => {
                    setIsDeleting(false);
                    setVisible(false);
                    if(navPath) {
                        navigate(navPath)
                    }
                },
                onError: (err) => {
                    setIsDeleting(false);
                    setErrorText(err.message);
                }
            });
        }, [mutate, navigate, idObj, navPath, setVisible]);

        return (
            <NorthStarDeleteConfirmationDialog
                title={`Delete ${name}`}
                visible={visible}
                onCancelClicked={() => setVisible(false)}
                onDeleteClicked={handleConfirmDelete}
                loading={isDeleting}
            >
                <Alert type="warning">
                    Delete {name}? This action cannot be undone.
                </Alert>
                {errorText && <Alert type="error">
                    {errorText}
                </Alert>}
            </NorthStarDeleteConfirmationDialog>
        );
    };

export default DeleteConfirmationDialog;
