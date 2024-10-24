/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { useSelect } from '@wordpress/data';
const { useState, useEffect, useCallback, useMemo } = wp.element;
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */


export default function Edit(props) {
	const { attributes, setAttributes } = props;
    const [acfFields, setAcfFields] = useState([]);
    
    // Get the current post ID
    const postId = useSelect(select => select("core/editor").getCurrentPostId());

    // Set the postId in attributes only if it's different
    useEffect(() => {
        if (postId && postId !== attributes.postId) {
            setAttributes({ postId });
        }
    }, [postId, attributes.postId, setAttributes]);

    // Fetch ACF fields dynamically when postId is set and update the component state
    useEffect(() => {
        if (attributes.postId) {
            fetch(`/wp-json/simple/v1/acf-fields/${attributes.postId}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.fields) {
                        setAcfFields(data.fields);
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch ACF fields", error);
                });
        }
    }, [attributes.postId]); // Depend on postId to refetch ACF fields when it changes


	const blockProps = useBlockProps()


	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__("Settings", "lengin")}>
				{acfFields.length > 0 ? (
					<SelectControl
						label={__("Acf Field", "lengin")}
						value={attributes.acfField}
						onChange={(acfField) => {
							setAttributes({ acfField });
						}}
						options={[
							{ label: 'Select an ACF field', value: '' },
							...acfFields.map(field => ({
								label: field.label,
								value: field.name,
							})),
						]}
					/>
				) : (
					<p>{__("ACF not available.", "lengin")}</p>
				)}
				</PanelBody>
			</InspectorControls>
			<ServerSideRender
				block="simple/acf-field-block"
				attributes={{
					...attributes
				}}
				emptyResponsePlaceholder={"Loading"}
			/>
		</div>
	);
}