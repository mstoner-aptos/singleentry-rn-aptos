package com.example.rn_socket_cam_custom
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.fragment.app.FragmentActivity
import com.example.R
import com.socketmobile.capture.socketcam.view.SocketCamFragment

class RNSocketCamCustomActivity : FragmentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.rn_socket_cam_custom_layout) // Ensure this layout contains the fragment_container

    // Retrieve parameters from the intent
    val clientOrDeviceHandle = intent.getIntExtra("customViewHandle", -1)
    val isScanContinuous = intent.getBooleanExtra("isScanContinuous", true)
    val mySocketCamFragment = SocketCamFragment.newInstance(clientOrDeviceHandle, isScanContinuous)

    supportFragmentManager.beginTransaction()
      .replace(R.id.fragment_container, mySocketCamFragment)
      .commitAllowingStateLoss()
  }

  // Ensure that this method has the correct signature
  public fun removeSocketCamFragment(view: View) {
    Log.d("removeSocketCamFragment: ", "Button clicked, removing fragment and ending activity.")
    finish()
  }
}
