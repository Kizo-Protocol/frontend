//@ts-ignore
import countryRegionData from "country-region-data/dist/data-umd";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Region {
  name: string;
  shortCode: string;
}

export interface CountryRegion {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

export const filterCountries = (
  countries: CountryRegion[],
  priorityCountries: string[],
  whitelist: string[],
  blacklist: string[],
): CountryRegion[] => {
  let countriesListedFirst: any[] = [];
  let filteredCountries = countries;

  if (whitelist.length > 0) {
    filteredCountries = countries.filter(
      ({ countryShortCode }) => whitelist.indexOf(countryShortCode) > -1,
    );
  } else if (blacklist.length > 0) {
    filteredCountries = countries.filter(
      ({ countryShortCode }) => blacklist.indexOf(countryShortCode) === -1,
    );
  }

  if (priorityCountries.length > 0) {
    priorityCountries.forEach((slug) => {
      const result = filteredCountries.find(
        ({ countryShortCode }) => countryShortCode === slug,
      );

      if (result) {
        countriesListedFirst.push(result);
      }
    });

    filteredCountries = filteredCountries.filter(
      ({ countryShortCode }) =>
        priorityCountries.indexOf(countryShortCode) === -1,
    );
  }

  return countriesListedFirst.length
    ? [...countriesListedFirst, ...filteredCountries]
    : filteredCountries;
};

export const filterRegions = (
  regions: Region[],
  priorityRegions: string[],
  whitelist: string[],
  blacklist: string[],
) => {
  let regionsListedFirst: any[] = [];
  let filteredRegions = regions;

  if (whitelist.length > 0) {
    filteredRegions = regions.filter(
      ({ shortCode }) => whitelist.indexOf(shortCode) > -1,
    );
  } else if (blacklist.length > 0) {
    filteredRegions = regions.filter(
      ({ shortCode }) => blacklist.indexOf(shortCode) === -1,
    );
  }

  if (priorityRegions.length > 0) {
    priorityRegions.forEach((slug) => {
      const result = filteredRegions.find(
        ({ shortCode }) => shortCode === slug,
      );

      if (result) {
        regionsListedFirst.push(result);
      }
    });

    filteredRegions = filteredRegions.filter(
      ({ shortCode }) => priorityRegions.indexOf(shortCode) === -1,
    );
  }

  return regionsListedFirst.length
    ? [...regionsListedFirst, ...filteredRegions]
    : filteredRegions;
};

export interface Region {
  name: string;
  shortCode: string;
}

export interface CountryRegion {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

interface CountrySelectProps {
  priorityOptions?: string[];
  whitelist?: string[];
  blacklist?: string[];
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

function CountrySelect({
  priorityOptions = [],
  whitelist = [],
  blacklist = [],
  onChange = () => {},
  className,
  placeholder = "Country",
}: CountrySelectProps) {
  const [countries, setCountries] = useState<CountryRegion[]>([]);

  useEffect(() => {
    setCountries(
      filterCountries(countryRegionData, priorityOptions, whitelist, blacklist),
    );
  }, []);

  return (
    <Select
      onValueChange={(value: string) => {
        onChange(value);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {countries.map(({ countryName, countryShortCode }) => (
          <SelectItem key={countryShortCode} value={countryShortCode}>
            {countryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CountrySelect;
