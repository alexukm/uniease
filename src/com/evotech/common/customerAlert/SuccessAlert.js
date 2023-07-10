import React from "react";
import { VStack, HStack, Alert, AlertIcon, Text, IconButton, CloseIcon } from "native-base";

const SuccessAlert = ({ title }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const onClose = () => {
        setIsOpen(false);
    };

    return isOpen ? (
        <Alert status="success" w="100%">
            <VStack space={2} flexShrink={1} w="100%">
                <HStack flexShrink={1} space={2} justifyContent="space-between">
                    <HStack space={2} flexShrink={1}>
                        <AlertIcon mt="1" />
                        <Text fontSize="md" color="coolGray.800">
                            {title}
                        </Text>
                    </HStack>
                    <IconButton variant="unstyled" onPress={onClose} icon={<CloseIcon size="3" />} />
                </HStack>
            </VStack>
        </Alert>
    ) : null;
};

export default SuccessAlert;
