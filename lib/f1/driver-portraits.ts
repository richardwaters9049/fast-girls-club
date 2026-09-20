type DriverPortraitRecord = {
  acronym: string;
  driverNumber: number;
  headshotUrl: string | null;
};

export function getStandingHeadshotUrl(
  standing: DriverPortraitRecord,
  liveDrivers: DriverPortraitRecord[],
): string | null {
  const acronym = standing.acronym.trim().toUpperCase();

  // Drivers can change their race numbers between seasons, so prefer the code.
  const match = acronym
    ? liveDrivers.find((driver) => driver.acronym.toUpperCase() === acronym)
    : liveDrivers.find((driver) => driver.driverNumber === standing.driverNumber);

  return match?.headshotUrl ?? standing.headshotUrl;
}
