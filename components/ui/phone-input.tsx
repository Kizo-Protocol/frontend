import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
    label?: string;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    (
      { className, onChange, value, error, helperText, label, ...props },
      ref,
    ) => {
      const handleChange = (value: string | undefined) => {
        if (onChange) {
          const syntheticEvent = {
            target: { value } as HTMLInputElement,
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(syntheticEvent);
        }
      };

      const CustomInputComponent = React.useCallback(
        (inputProps: any) => <InputComponent {...inputProps} error={error} />,
        [error],
      );

      return (
        <div className={cn("w-full", className)}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
            </label>
          )}
          <div className="relative">
            <RPNInput.default
              ref={ref}
              className="flex w-full"
              countrySelectComponent={CountrySelect}
              defaultCountry="ID"
              flagComponent={FlagComponent}
              inputComponent={CustomInputComponent}
              smartCaret={false}
              value={value || undefined}
              onChange={handleChange}
              {...props}
            />
          </div>
          {helperText && (
            <p
              className={cn(
                "mt-1 text-xs",
                error ? "text-red-500" : "text-gray-500",
              )}
            >
              {helperText}
            </p>
          )}
        </div>
      );
    },
  );

PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { error?: boolean; isValid?: boolean | null }
>(
  (
    { className, disabled, value, placeholder, error, isValid, ...props },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);

    const handleFocus = () => {
      setFocused(true);
    };

    const handleBlur = () => {
      setFocused(false);
    };

    const hasValue =
      typeof value === "string"
        ? value.length > 0
        : Array.isArray(value)
          ? value.length > 0
          : typeof value === "number"
            ? value.toString().length > 0
            : false;

    const getBorderColor = () => {
      if (error) return "border-red-500";
      if (isValid === true) return "border-green-500";
      if (focused) return "border-blue-500";

      return "border-gray-200";
    };

    const getBgColor = () => {
      if (disabled) return "bg-gray-50";
      if (focused) return "bg-white";

      return "bg-white hover:bg-gray-50";
    };

    return (
      <div
        className={cn(
          "group flex flex-col w-full",
          disabled && "opacity-60",
          className,
        )}
      >
        <div
          className={cn(
            "relative w-full inline-flex rounded-r-xl transition-all duration-200 h-14 py-1.5 px-3",
            "border-1 border-l-0",
            getBorderColor(),
            getBgColor(),
            "focus-within:ring-2 focus-within:ring-blue-100",
          )}
        >
          <label
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm transition-all duration-200 pointer-events-none",
              (focused || hasValue) && "text-xs -translate-y-4 text-gray-400",
            )}
            htmlFor="phone-number"
          >
            {typeof placeholder === "string" && placeholder.length > 0
              ? placeholder
              : "Enter phone number"}
          </label>
          <input
            className={cn(
              "w-full bg-transparent text-black text-sm outline-none pt-4",
              "font-mono tracking-wide",
            )}
            {...props}
            ref={ref}
            autoComplete="tel"
            id="phone-number"
            value={value || ""}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
          {isValid === true && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <CheckIcon className="h-4 w-4 text-green-500" />
            </div>
          )}
          {error && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
  error?: boolean;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
  error,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const getBorderColor = () => {
    if (error) return "border-red-500";

    return "border-gray-200 hover:border-gray-300";
  };

  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        open && setSearchValue("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "flex gap-2 rounded-e-none rounded-s-lg border-1 px-3 focus:z-10 h-14 bg-gray-50 hover:bg-gray-100 transition-colors",
            getBorderColor(),
            disabled && "opacity-50 cursor-not-allowed",
          )}
          disabled={disabled}
          type="button"
          variant="ghost"
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <span className="text-xs text-gray-600 font-mono">
            +
            {selectedCountry
              ? RPNInput.getCountryCallingCode(selectedCountry)
              : ""}
          </span>
          <ChevronsUpDown
            className={cn(
              "size-4 opacity-50 transition-transform",
              isOpen && "rotate-180",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder="Search country or code..."
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]",
                  );

                  if (viewportElement) {
                    viewportElement.scrollTop = 0;
                  }
                }
              }, 0);
            }}
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList
                  .filter(({ value, label }) => {
                    if (!searchValue) return true;
                    const search = searchValue.toLowerCase();

                    try {
                      return (
                        label.toLowerCase().includes(search) ||
                        (value &&
                          RPNInput.getCountryCallingCode(value).includes(
                            search,
                          ))
                      );
                    } catch {
                      return label.toLowerCase().includes(search);
                    }
                  })
                  .map(({ value, label }) =>
                    value ? (
                      <CountrySelectOption
                        key={value}
                        country={value}
                        countryName={label}
                        selectedCountry={selectedCountry}
                        onChange={onChange}
                        onSelectComplete={() => setIsOpen(false)}
                      />
                    ) : null,
                  )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  const isSelected = country === selectedCountry;

  return (
    <CommandItem
      className={cn(
        "gap-2 cursor-pointer transition-colors",
        isSelected && "bg-blue-50 text-blue-700",
      )}
      onSelect={handleSelect}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm font-medium">{countryName}</span>
      <span className="text-sm text-gray-500 font-mono min-w-12 text-right">
        +{RPNInput.getCountryCallingCode(country)}
      </span>
      <CheckIcon
        className={cn(
          "ml-2 size-4 transition-opacity",
          isSelected ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 border border-gray-200 shadow-sm [&_svg:not([class*='size-'])]:size-full">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">?</span>
        </div>
      )}
    </span>
  );
};

export { PhoneInput };
