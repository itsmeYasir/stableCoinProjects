import { useContractRead } from 'wagmi';

const useCustomContractRead = ({Adrress,Abi,FuncName,Args,isWatch,isEnabled}) => {  
    const _useContractRead = useContractRead(
        {
        address: Adrress,
        abi:Abi ,
        functionName:FuncName,
        args:Args,
        watch: isWatch??true,
        enabled: isEnabled??true,
        }
    );

    
    return _useContractRead;
};

export default useCustomContractRead;