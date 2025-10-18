import { Input } from "@/components/ui/input"
import { useRef } from 'react';

export function InputFile() {
    const inputButtonRef = useRef<HTMLInputElement>(null);
    function handleClick() {
        simulateButtonClick()
    }

    function simulateButtonClick() {
      if (inputButtonRef.current) {
        inputButtonRef.current.click();
      }
    };

  return (
    <div className="grid w-auto max-w-sm items-center gap-3">
        <div className="border w-auto h-auto rounded-2xl" onClick={handleClick}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 m-1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
        </div>
      <Input ref={inputButtonRef} onClick={simulateButtonClick} id="picture" type="file" style={
        {display: 'none'}
      } />
    </div>
  )
}
