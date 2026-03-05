package com.example.rn_socket_cam_custom

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class RNSocketCamCustomViewManager : SimpleViewManager<RNSocketCamCustomView>() {
  override fun getName() = "RNSocketCamCustomViewManager"

  override fun createViewInstance(reactContext: ThemedReactContext): RNSocketCamCustomView {
    return RNSocketCamCustomView(reactContext, "Your Message Here") // Pass a message if needed
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    return mapOf(
            "nativeClick" to
                    mapOf(
                            "registrationName" to "onNativeClick"
                    ) // Use same name as in callNativeEvent
    )
  }

  // Prop for isScanContinuous
  @ReactProp(name = "isScanContinuous")
  fun setIsScanContinuous(view: RNSocketCamCustomView, isScanContinuous: Boolean) {
    view.setIsScanContinuous(isScanContinuous)
  }

  // Prop for customViewHandle
  @ReactProp(name = "customViewHandle")
  fun setCustomViewHandle(view: RNSocketCamCustomView, customViewHandle: Int) {
    view.setCustomViewHandle(customViewHandle)
  }
}
