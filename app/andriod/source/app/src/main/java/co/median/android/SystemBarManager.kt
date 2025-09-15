package co.median.android

import android.content.res.Configuration
import android.os.Build
import android.text.TextUtils
import android.view.View
import android.view.ViewGroup
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import co.median.median_core.AppConfig
import co.median.median_core.GNLog

class SystemBarManager(val mainActivity: MainActivity) {

    private val isAndroid15orAbove = Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM

    private lateinit var insetsController: WindowInsetsControllerCompat
    private lateinit var statusBarStyle: SystemBarStyle
    private lateinit var systemNavBarStyle: SystemBarStyle
    private lateinit var statusBarBackgroundView: View
    private lateinit var systemNavBarBackgroundView: View
    private lateinit var mainLayout: CoordinatorLayout
    private var currentStatusBarStyle = AppConfig.getInstance(mainActivity).statusBarStyle
    private var currentSystemNavBarStyle = AppConfig.getInstance(mainActivity).systemNavBarStyle

    fun applyEdgeToEdge() {
        // Notes: On Android 15+, system bars are transparent by default.
        // To modify their appearance, set a background color for the app's view.
        // Currently using statusBarBackground color, see setOnApplyWindowInsetsListener.

        val statusBarBackgroundColor =
            mainActivity.resources.getColor(R.color.statusBarBackground, null)
        statusBarStyle = createSystemBarStyle(currentStatusBarStyle, statusBarBackgroundColor)

        val systemNavBarBackgroundColor =
            mainActivity.resources.getColor(R.color.systemNavBarBackground, null)
        systemNavBarStyle = createSystemBarStyle(currentSystemNavBarStyle, systemNavBarBackgroundColor)

        mainActivity.enableEdgeToEdge(
            statusBarStyle = statusBarStyle,
            navigationBarStyle = systemNavBarStyle
        )
    }

    fun setupWindowInsetsListener(view: ViewGroup) {
        this.mainLayout = view.findViewById(R.id.main_layout)
        this.statusBarBackgroundView = view.findViewById(R.id.status_bar_background)
        this.systemNavBarBackgroundView = view.findViewById(R.id.system_nav_bar_background)

        if (!isAndroid15orAbove) {
            // These views are only needed on Android 15+,
            // so we hide them on earlier versions for good measure
            this.statusBarBackgroundView.visibility = View.GONE
            this.systemNavBarBackgroundView.visibility = View.GONE
        }

        // Sets up the listener to handle system bar insets and adjust view padding accordingly.
        // Re-applies when system insets changes or requestApplyInsets() is called.
        ViewCompat.setOnApplyWindowInsetsListener(view) { v: View, insets: WindowInsetsCompat ->

            val appConfig = AppConfig.getInstance(mainActivity)
            val systemBars =
                insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val topPadding = if (appConfig.enableOverlayInStatusBar) 0 else systemBars.top

            val keyboardHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            val bottomInset = if (keyboardHeight > 0 ) keyboardHeight else systemBars.bottom
            val bottomPadding = if (appConfig.enableOverlayInSystemNavBar) 0 else bottomInset

            if (isAndroid15orAbove) {
                // On Android 15+, system bars are always transparent by default.
                // To control their appearance, background views are added behind the system bars,
                // allowing the app to apply custom colors as a workaround.

                v.setPadding(systemBars.left, 0, systemBars.right, 0)
                this.mainLayout.setPadding(0, topPadding, 0, bottomPadding)

                val statusBarLayoutParams = this.statusBarBackgroundView.layoutParams
                statusBarLayoutParams.height = systemBars.top
                this.statusBarBackgroundView.layoutParams = statusBarLayoutParams

                val systemNavBarLayoutParams = this.systemNavBarBackgroundView.layoutParams
                systemNavBarLayoutParams.height = systemBars.bottom
                this.systemNavBarBackgroundView.layoutParams = systemNavBarLayoutParams
            } else {
                v.setPadding(systemBars.left, topPadding, systemBars.right, bottomPadding)
            }

            WindowInsetsCompat.CONSUMED
        }

        this.insetsController =
            WindowCompat.getInsetsController(mainActivity.window, mainActivity.window.decorView)

        // Disable adding contrast to 3-button navigation
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            mainActivity.window.isNavigationBarContrastEnforced = false
        }
    }

    fun requestApplyInsets() {
        mainActivity.window.decorView.requestApplyInsets()
    }

    fun setStatusBarColor(color: Int) {
        if (isAndroid15orAbove) {
            this.statusBarBackgroundView.setBackgroundColor(color)
        } else {
            this.statusBarStyle = createSystemBarStyle(currentStatusBarStyle, color)
            mainActivity.enableEdgeToEdge(
                statusBarStyle = this.statusBarStyle,
                navigationBarStyle = this.systemNavBarStyle
            )
        }
    }

    fun setSystemNavBarColor(color: Int) {
        if (isAndroid15orAbove) {
            this.systemNavBarBackgroundView.setBackgroundColor(color)
        } else {
            this.systemNavBarStyle = createSystemBarStyle(currentSystemNavBarStyle, color)
            mainActivity.enableEdgeToEdge(
                statusBarStyle = this.statusBarStyle,
                navigationBarStyle = this.systemNavBarStyle
            )
        }
    }

    fun setSystemBarColor(color: Int) {
        setStatusBarColor(color)
        setSystemNavBarColor(color)
    }

    private fun createSystemBarStyle(style: String, color: Int): SystemBarStyle {
        return if (isLightMode(style)) {
            SystemBarStyle.light(color, color)
        } else {
            SystemBarStyle.dark(color)
        }
    }

    fun updateStatusBarStyle(style: String?) {
        if (style.isNullOrBlank()) return
        this.currentStatusBarStyle = style
        insetsController.isAppearanceLightStatusBars = isLightMode(style)
    }

    fun updateSystemNavBarStyle(style: String?) {
        if (style.isNullOrBlank()) return
        this.currentSystemNavBarStyle = style
        insetsController.isAppearanceLightNavigationBars = isLightMode(style)
    }

    fun enableFullScreen(fullscreen: Boolean) {
        if (fullscreen) {
            insetsController.apply {
                hide(WindowInsetsCompat.Type.systemBars())
                systemBarsBehavior =
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            insetsController.apply {
                show(WindowInsetsCompat.Type.systemBars())
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_DEFAULT
            }
        }
    }

    private fun isLightMode(theme: String): Boolean {
        if (!TextUtils.isEmpty(theme)) {
            when (theme) {
                "light" -> return true
                "dark" -> return false
                "auto" -> {
                    val nightModeFlags: Int =
                        mainActivity.getResources().configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
                    when (nightModeFlags) {
                        Configuration.UI_MODE_NIGHT_YES -> {
                            return false
                        }

                        Configuration.UI_MODE_NIGHT_NO -> {
                            return true
                        }

                        else -> {
                            GNLog.getInstance()
                                .logError(TAG, "isLightMode: Current mode is undefined")
                        }
                    }
                }
            }
        }
        return true // Default to light mode if nothing matches
    }

    companion object {
        private const val TAG = "SystemBarManager"
    }
}

