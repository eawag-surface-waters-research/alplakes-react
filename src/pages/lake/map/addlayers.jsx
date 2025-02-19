import React, { Component } from "react";
import Translations from "../../../translations.json";
import ShowMoreText from "../../../components/showmore/showmore";

class AddLayers extends Component {
  addLayer = (id) => {
    this.props.toggleAddLayersModal();
    this.props.addLayer(id);
  };
  render() {
    var { language, layers, images, addLayersModal, toggleAddLayersModal } =
      this.props;
    return (
      <div className={addLayersModal ? "add-layers" : "add-layers hidden"}>
        <div className="layers-close" onClick={toggleAddLayersModal}>
          &#10005;
        </div>
        <div className="layers-title">Available Layers</div>
        <div className="layers">
          {layers.map((l) => {
            let source = l.sources[l.source];
            return (
              <div
                className={l.active ? "layer disabled" : "layer"}
                key={l.id}
                onClick={() => this.addLayer(l.id)}
                title={l.active ? "" : "Add to map"}
              >
                <div className="status">{l.active ? "Added" : "Add"}</div>
                <div className={"icon " + l.type}>
                  <img src={images[l.parameter]} alt={l.parameter} />
                </div>
                <div className="text">
                  <div className="parameter">
                    {l.parameter in Translations
                      ? Translations[l.parameter][language]
                      : ""}
                  </div>
                  <div className="type">
                    {l.type in Translations
                      ? Translations[l.type][language]
                      : ""}
                  </div>
                </div>
                <div className="description">
                  <ShowMoreText
                    text={source.description[language]}
                    links={{}}
                    maxLength={200}
                    toggle={false}
                  />
                </div>
                {source.tags && (
                  <div className="tags">
                    {source.tags.map((t) => (
                      <div className="tag" key={t}>
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default AddLayers;
