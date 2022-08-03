<script lang="ts">
  import { loadGoogleDocAsScrollyTeller } from './loadGoogleDocScrollyTeller';
  const URL_LOCALSTORAGE_KEY = 'google-doc-url';

  let googleDocUrl = localStorage.getItem(URL_LOCALSTORAGE_KEY) || '';

  let scrollyData;
  let introPars = [];
  let name = 'first';

  const updateDoc = async (url: string) => {
    localStorage.setItem(URL_LOCALSTORAGE_KEY, url);

    if (!url) {
      introPars = [];
      scrollyData = null;
      return;
    }
    try {
      const { intro, scrollytellerDefinition } = await loadGoogleDocAsScrollyTeller(url, {});
      if (scrollytellerDefinition) {
        introPars = intro;
        scrollyData = scrollytellerDefinition;
        name = scrollytellerDefinition.panels[0].data.name;
      } else {
        introPars = [];
        scrollyData = null;
      }
    } catch (e) {
      introPars = [];
      scrollyData = null;
    }
  };

  $: updateDoc(googleDocUrl);


</script>

<div class="google-doc-input">
  <input bind:value={googleDocUrl} />
</div>

{#if scrollyData}
  {#each introPars as par, i}
    <p class={i === 0 ? "first u-dropcap" : ""}>{par}</p>
  {/each}

  <div class="u-full">
    <slot {scrollyData} panelName={name} />
  </div>
{:else}
    <p class="FormatCredit">
      SELECT A GOOGLE DOC TO PREVIEW
    </p>
{/if}

<style>
  .FormatCredit {
    padding-top: 150px;
    padding-bottom: 150px;
    text-align: center;
  }
  .google-doc-input {
    padding: 1rem;
    background: rgba(179,179,179,.7);
  }

  .google-doc-input > input {
    width: 100%;
    font-size: 1rem;
    padding: 0.5rem;
    color: #675f5f;
  }
</style>
