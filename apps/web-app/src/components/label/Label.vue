import { dividerProps } from 'element-plus'; import { dividerProps } from 'element-plus';
<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  labelList: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['searching'])
const handleSearch = (labelName) => {
  emit('searching', labelName)
}
</script>

<template>
  <div class="tag-container">
    <div class="tags">
      <div class="tag" v-for="label in props.labelList" :key="label.id">
        <a href="javascript:;" @click="handleSearch(label.name)">
          <span>{{ label.name }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@hover-color: #00c3ff;

.tag-container {
  display: flex;
  justify-content: space-between;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  height: 29px;
  font-size: 12px;
}
.tags .tag {
  height: 24px;
  line-height: 24px;
  border-radius: 12px;
  margin-right: 10px;
  background-color: #f5f5f5;
  cursor: pointer;
  a {
    padding: 0 12px;
    color: #666;
  }
  a:hover {
    color: @hover-color;
  }
}
</style>
