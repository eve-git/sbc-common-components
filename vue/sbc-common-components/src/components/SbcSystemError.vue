<template>
    <v-card>
        <v-card-title>
            <div v-html="cardTitle" />
        </v-card-title>
        <v-card-text>
            <p v-html="cardDesc"></p>
            <p>
                <v-icon small>phone</v-icon>
                <a href="tel:+1-877-526-1526" class="error-dialog-padding">1-877-526-1526</a>
            </p>
            <p>
                <v-icon small>email</v-icon>
                <a href="mailto:BCRegistries@gov.bc.ca" class="error-dialog-padding"
                >BCRegistries@gov.bc.ca</a>
            </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="primary"  @click="submit()" v-if="primaryButtonTitle">{{ primaryButtonTitle }}</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat @click="cancel()" v-if="secondaryButtonTitle">{{ secondaryButtonTitle }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  title: {
    type: String
  },
  description: {
    type: String
  },
  primaryButtonTitle: {
    type: String
  },
  secondaryButtonTitle: {
    type: String
  },
  showModal: {
    type: Boolean
  }
})
const emit = defineEmits(['continue-event', 'cancel-event'])
const defaultDesc = 'We were unable to save your filing. You can continue to try to save this filing or you can exit without saving and re-create this filing at another time.\n' +
        'If you exit this filing, any changes you\'ve made will not be saved.'
const defaultTitle = 'Unable to Save Filing'
const cardTitle = () => computed(() => props.title || defaultTitle)
const cardDesc = () => computed(() => props.description || defaultDesc)
const submit = () => emit('continue-event')
const cancel = () => emit('cancel-event')
</script>

<style lang="scss" scoped>
    @import '../assets/scss/theme.scss';
    @import '../assets/scss/overrides.scss';
    article{
        .v-card{
            line-height: 1.2rem;
            font-size: 0.875rem;
        }
    }
    section p{
        // font-size 0.875rem
        color: $gray6;
    }
    section + section{
        margin-top: 3rem;
    }
    h2{
        margin-bottom: 0.25rem;
    }
    .title-container{
        margin-bottom: 0.5rem;
    }
    #buttons-container{
        padding-top: 2rem;
        border-top: 1px solid $gray5;
        .buttons-left{
            width: 50%;
        }
        .buttons-right{
            margin-left: auto;
        }
        .v-btn + .v-btn{
            margin-left: 0.5rem;
        }
    }
    .error-dialog-padding{
        margin-left: 1rem;
    }
</style>
