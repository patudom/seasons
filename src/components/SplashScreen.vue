<template>
  <v-overlay
    :model-value="showSplashScreen"
    absolute
    opacity="0.6"
    :style="cssVars"
    id="splash-overlay"
  >
    <focus-trap>
    <div
      id="splash-screen"
      v-click-outside="closeSplashScreen"
      :style="cssVars"
    >
      <font-awesome-icon
        id="close-splash-button"
        @click="closeSplashScreen"
        @keyup.enter="closeSplashScreen"
        icon="xmark"
        tabindex="0"
      />
      <div id="splash-title">
        <p>The Sun's Seasonal Journey</p>
      </div>
      <div id="invitation">
        See how the Sun's path changes on the solstices and equinoxes from any location on Earth!
      </div>

      <div id="location-input-section">
        <p class="location-prompt">Enter a location:</p>
        <location-search
          :class="['splash-location-search']"
          small
          button-size="large"
          :accent-color="cssVars['--accent-color']"
          :search-provider="searchProvider"
          @set-location="handleLocationSet"
          @error="searchErrorMessage = $event"
          placeholder="Enter city, state, or address"
        >
        </location-search>
        <div v-if="searchErrorMessage" class="error-message">
          {{ searchErrorMessage }}
        </div>
      </div>
      <div class="medium">
        or
      </div>
      <div>
        <v-btn
          class="splash-get-started"
          @click="closeSplashScreen"
          @keyup.enter="closeSplashScreen"
          :color="cssVars['--accent-color']"
          :density="$vuetify.display.xs ? 'compact' : 'default'"
          :size="$vuetify.display.width < 500 || $vuetify.display.height < 550 ? 'medium' : 'x-large'"
          variant="elevated"
          rounded="lg"
        >
          Use Cambridge, MA
        </v-btn>
      </div>
    
      <div id="splash-screen-acknowledgements">
        <span>
        Brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
        </span>
        <div id="splash-screen-logos">
          <credit-logos
            :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
          />
        </div>
      </div>
    </div>
    </focus-trap>
  </v-overlay>
</template>


<script setup lang="ts">
import {computed, defineProps, ref } from 'vue';
import { MapBoxFeature, MapBoxFeatureCollection, geocodingInfoForSearch } from "@cosmicds/vue-toolkit/src/mapbox";

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cssVars?: any;
  title: string;
  color?: string,
  highlightColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  cssVars: () => ({}),
});

const cssVars = computed(() => {
  return {
    ...props.cssVars,
    ...{'--accent-color': props.color == null ? props.cssVars['--accent-color'] : props.color},
  };
});

const emits = defineEmits(['close', 'location-selected']);

const showSplashScreen = defineModel({ default: true });
const searchErrorMessage = ref<string | null>(null);

const geocodingOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  access_token: process.env.VUE_APP_MAPBOX_ACCESS_TOKEN ?? "", 
};

function searchProvider(text: string): Promise<MapBoxFeatureCollection> {
  return geocodingInfoForSearch(text, geocodingOptions);
}

function handleLocationSet(feature: MapBoxFeature) {
  emits('location-selected', feature);
  searchErrorMessage.value = null;
}

function closeSplashScreen() {
  showSplashScreen.value = false;
  emits('close');
}


</script>


<style lang="less">

#splash-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: width 0.5s, height 0.5s;
}

#splash-screen {
  color: #E0E0E0;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: space-around;
  height: fit-content;
  max-height: 85vh;

  backdrop-filter: blur(5px);

  border-radius: 5%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  padding-block: 2rem;

  @media (max-width: 699px) {
    max-width: 90vw;
  }

  @media (max-height: 600px) {
    max-width: 95vw;
  }

  div {
    margin-inline: auto;
    text-align: center;
  }

  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: bold;
    vertical-align: middle;
  }

  .small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #close-splash-button {
    position: absolute;
    top: 1rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: 2rem;

    &:hover {
      cursor: pointer;
    }
  }

  #splash-title {
    display: flex;
    flex-direction: column;
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-size: 3.5rem;
    line-height: 1.1;
    width: 90%;
    text-align: center;
    padding-block: 1rem;
    margin: auto;

    @media (max-width: 699px) {
      font-size: 2.5rem;
    }

    @media (max-height: 600px) {
      font-size: 2.5rem;
      padding-block: 0.25rem;
    }
  }

  #invitation {
    font-family: Verdana, Arial, Helvetica, sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    width: 80%;
    padding-block: 0.5rem;

    @media (max-width: 699px) {
      display: none;
    }

    @media (max-height: 600px) {
      display: none;
    }
  }

  #location-input-section {
    margin: 1rem auto;
    width: 100%;
    
    .location-prompt {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .splash-location-search {
      width: 75%;
      max-width: 400px;
      margin: 0 auto;

      // Make the v-field width match the v-input width

      .v-field {
        padding: 0 !important;
      }
      
      .v-field__field {
        width: 100% !important;
      }

      .v-field__input {
        padding: 0 !important;
      }
      
      .v-input__control {
        width: 100% !important;
        pointer-events: auto !important;
        cursor: text !important;
      }

      // Make sure the input element itself is full width
      input {
        width: 100% !important;
        height: 100% !important;
        pointer-events: auto !important;
        cursor: text !important;
        padding: 0;
      }
    }
    
    .error-message {
      color: #ff6b6b;
      font-size: 1rem;
      margin-top: 1rem;
    }
  }

  .medium {
    font-family: Verdana, Arial, Helvetica, sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  // Make the div containing the Get Started button only as tall as the button
  div:has(.splash-get-started) {
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
  }

  .splash-get-started {
    border: 2px solid white;
    font-size: 1.1rem;
    font-weight: bold !important;
    text-transform: none !important;

    @media (max-width: 500px) {
      font-size: 1rem;
      padding: 0.5rem;
    }

    @media (max-height: 550px) {
      font-size: 1rem;
      padding: 0.5rem;
    }
  }

  #splash-screen-acknowledgements {
    // margin-top: 3rem;
    margin-top: clamp(0.5rem, 3vh, 3rem);
    font-size: 1rem;
    width: 60%; 
    margin-bottom: 1rem;

    // @media (max-width: 600px) {
    //   display: none;
    // }

    @media (max-height: 500px) {
      display: none;
    }
  }

  #splash-screen-logos {
    margin-top: 1.5em;

    img {
      height: 5vmin;
      vertical-align: middle;
      margin: 2px;
    }

    @media only screen and (max-width: 600px) {
      img {
        height: 24px;
      }
    }

    svg {
      vertical-align: middle;
      height: 24px;
    }
    @media (max-height: 600px) {
      display: none;
    }
  }
}

</style>
