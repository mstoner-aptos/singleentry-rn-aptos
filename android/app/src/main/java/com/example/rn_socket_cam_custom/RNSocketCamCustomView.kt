package com.example.rn_socket_cam_custom

import android.content.Context
import android.content.Intent
import android.util.AttributeSet
import android.util.Log
import android.widget.LinearLayout
import com.example.R
import com.facebook.react.uimanager.annotations.ReactProp

class RNSocketCamCustomView
@JvmOverloads
constructor(
        context: Context,
        message: String?,
        attrs: AttributeSet? = null,
        defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

  private var customViewHandle: Int = -1
  private var isScanContinuous: Boolean = true
  private var isScanSet: Boolean = false
  private var isCustomHandleSet: Boolean = false

  init {
    inflate(context, R.layout.rn_socket_cam_custom_layout, this) // Inflate the layout
  }

  @ReactProp(name = "isScanContinuous")
  fun setIsScanContinuous(isScanContinuous: Boolean) {
    this.isScanContinuous = isScanContinuous
    this.isScanSet = true
    startSocketCamActivity() // Start the activity when property is set
  }

  @ReactProp(name = "customViewHandle")
  fun setCustomViewHandle(customViewHandle: Int) {
    this.customViewHandle = customViewHandle
    this.isCustomHandleSet = true
    startSocketCamActivity() // Start the activity when property is set
  }

  private fun startSocketCamActivity() {
    if (isScanSet && isCustomHandleSet) {
      val intent =
              Intent(context, RNSocketCamCustomActivity::class.java).apply {
                putExtra("customViewHandle", customViewHandle)
                putExtra("isScanContinuous", isScanContinuous)
              }
      context.startActivity(intent) // Start the activity
    } else {
      Log.d("startSocketCamActivity: ", "NOT READY YET")
    }
  }
}
