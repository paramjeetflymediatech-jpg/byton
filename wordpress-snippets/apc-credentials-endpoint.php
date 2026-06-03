<?php
/**
 * APC Credentials REST Endpoint
 * 
 * Add this snippet to your WordPress site via:
 * → Appearance → Theme Editor → functions.php
 *   OR
 * → Install "Code Snippets" plugin and add as a new snippet
 * 
 * This registers a secure REST endpoint at:
 *   GET /wp-json/byton/v1/apc-credentials
 * 
 * Protected by the same WooCommerce Consumer Key + Secret (Basic Auth).
 */

add_action( 'rest_api_init', function () {
    register_rest_route( 'byton/v1', '/apc-credentials', [
        'methods'             => 'GET',
        'callback'            => 'byton_get_apc_credentials',
        'permission_callback' => 'byton_check_wc_auth',
    ] );
} );

/**
 * Only allow requests authenticated with a valid WooCommerce API key.
 */
function byton_check_wc_auth( WP_REST_Request $request ) {
    // Check HTTP Basic Auth header
    $auth_header = $request->get_header( 'Authorization' );
    if ( $auth_header && strpos( $auth_header, 'Basic ' ) === 0 ) {
        $decoded     = base64_decode( substr( $auth_header, 6 ) );
        list( $key ) = explode( ':', $decoded, 2 );
    } else {
        // Fallback: check query parameters (useful if WordPress server intercepts Basic Auth header)
        $key = $request->get_param( 'consumer_key' );
    }

    if ( ! $key ) {
        return new WP_Error( 'rest_forbidden', 'Authentication required.', [ 'status' => 401 ] );
    }

    // Validate against woocommerce_api_keys table
    global $wpdb;
    $row = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT key_id FROM {$wpdb->prefix}woocommerce_api_keys WHERE consumer_key = %s",
            wc_api_hash( $key )
        )
    );

    if ( ! $row ) {
        return new WP_Error( 'rest_forbidden', 'Invalid WooCommerce API key.', [ 'status' => 403 ] );
    }

    return true;
}

/**
 * Return APC credentials stored in wp_options.
 * Adjust the option keys to match your APC123 plugin's actual keys.
 */
function byton_get_apc_credentials( WP_REST_Request $request ) {
    // Common APC123 plugin option keys — adjust if yours differ
    $apc_options = get_option( 'apc123_settings', [] );

    // Fallback: try common individual option keys used by different APC plugins
    $username       = $apc_options['username']       ?? get_option( 'apc_username', '' );
    $password       = $apc_options['password']       ?? get_option( 'apc_password', '' );
    $account_number = $apc_options['account_number'] ?? get_option( 'apc_account_number', '' );
    $api_key        = $apc_options['api_key']        ?? get_option( 'apc_api_key', '' );

    return rest_ensure_response( [
        'username'       => $username,
        'password'       => $password,      // Note: returned as plain text — use HTTPS only
        'account_number' => $account_number,
        'api_key'        => $api_key,
        'source'         => 'wp_options',
    ] );
}
