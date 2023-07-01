
import { usePrepareContractWrite,useContractWrite,useWaitForTransaction } from 'wagmi';

const useCustomContractWrite = ({Adrress,Abi,FuncName,Args,Value,isEnabled}) => {  
    const _usePrepareContractWrite = usePrepareContractWrite(
        {
        address: Adrress,
        abi:Abi ,
        functionName:FuncName,
        args:Args,
        value:Value,
        enabled:isEnabled
        }
    );
    const _useContractWrite = useContractWrite(_usePrepareContractWrite?.config );
    // console.log(_usePrepareContractWrite?.config);
    // console.log(_useContractWrite);
    const _useWaitForTransaction=useWaitForTransaction({
        hash:_useContractWrite?.data?.hash
    })
    return {_useContractWrite,_useWaitForTransaction}
};

export default useCustomContractWrite;