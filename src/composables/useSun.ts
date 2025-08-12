import { Ref, ref, computed } from "vue";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Place} from "@wwtelescope/engine";
import { AltAzRad, EquatorialRad, LocationDeg, LocationRad } from "../types";
import { equatorialToHorizontal } from "../utils";
import { D2R } from "@cosmicds/vue-toolkit";
import { engineStore } from "@wwtelescope/engine-pinia";
type WWTEngineStore = ReturnType<typeof engineStore>;


const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 40;
const MILLISECONDS_PER_INTERVAL = 1000 * secondsInterval;

type RefOrType<T> = Ref<T> | T;

export interface UseSunOptions {
  store: WWTEngineStore;
  location: Ref<LocationDeg>;
  selectedTime: RefOrType<number>;
  selectedTimezoneOffset: RefOrType<number>;
  zoomLevel?: number;
  onStart?: () => void;
}

export function useSun(options: UseSunOptions) {
  
  options.store.waitForReady().then(async () => {
    if (options.onStart) {
      options.onStart();
    }
  });
  
  const selectedTime = ref(options.selectedTime);
  const selectedTimezoneOffset = ref(options.selectedTimezoneOffset);
  
  const locationRad = computed<LocationRad>(() => {
    return {
      latitudeRad: options.location.value.latitudeDeg * D2R,
      longitudeRad: options.location.value.longitudeDeg * D2R,
    };
  });

  const sunPlace = new Place();
  sunPlace.set_names(["Sun"]);
  sunPlace.set_classification(Classification.solarSystem);
  sunPlace.set_target(SolarSystemObjects.sun);
  sunPlace.set_zoomLevel(options.zoomLevel ?? 20);
  
  const sunPosition = computed<EquatorialRad>(() =>{
    return {
      raRad: sunPlace.get_RA() * 15 * D2R,
      decRad: sunPlace.get_dec() * D2R,
    } as EquatorialRad;
  });

  function getSunPositionAtTime(time: Date): AltAzRad {
    console.log(options.location.value);
    const sunAltAz = equatorialToHorizontal(sunPosition.value.raRad, sunPosition.value.decRad, locationRad.value.latitudeRad, locationRad.value.longitudeRad, time);
    return sunAltAz;
  }

  // function that finds at what time the sun will reach a given altitude during the current day to within 15 minutes
  function getTimeforSunAlt(altDeg: number, referenceTime?: number): { rising: number | null; setting: number | null; } {
    // takes about 45ms to run
    // search for time when sun is at given altitude
    // start at 12:00am and search every MINUTES_PER_INTERVAL
    const refTime = referenceTime ?? selectedTime.value;
    const minTime = refTime - (refTime % MILLISECONDS_PER_DAY) - selectedTimezoneOffset.value;
    const maxTime = minTime + MILLISECONDS_PER_DAY;
    console.log(`Min time: ${new Date(minTime)}`);
    console.log(`Max time: ${new Date(maxTime)}`);
    // const ehr = eclipticHorizonAngle(location.latitudeRad, dateTime);
    let time = minTime;
    let sunAlt = getSunPositionAtTime(new Date(time)).altRad; // negative
    console.log(sunAlt);
    // find the two times it crosses the given altitude
    while ((sunAlt < altDeg * D2R) && (time < maxTime)) {
      time += MILLISECONDS_PER_INTERVAL;
      sunAlt = getSunPositionAtTime(new Date(time)).altRad;
    }
    const rising = time == maxTime ? null : time;
    while ((sunAlt > altDeg * D2R) && (time < maxTime)) {
      time += MILLISECONDS_PER_INTERVAL;
      sunAlt = getSunPositionAtTime(new Date(time)).altRad;
    }
    const setting = time == maxTime ? null : time;

    return {
      'rising': (rising !== null && setting !== null) ? Math.min(rising, setting) : rising,
      'setting': (rising !== null && setting !== null) ? Math.max(rising, setting) : setting
    };
  }
  
  
  return { getTimeforSunAlt, getSunPositionAtTime, sunPlace, sunPosition };
}
